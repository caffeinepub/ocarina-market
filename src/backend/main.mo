import Map "mo:core/Map";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import Text "mo:core/Text";
import MixinStorage "blob-storage/Mixin";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Migration "migration";
import Blob "mo:core/Blob";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ItemCategory = { #printed; #ceramic };

  public type Item = {
    id : Blob;
    title : Text;
    photo : Storage.ExternalBlob;
    contentType : Text;
    description : Text;
    priceInCents : Nat;
    sold : Bool;
    published : Bool;
    createdBy : Principal;
    category : ItemCategory;
    shapeCategory : Text;
    quantity : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type BulkItemInput = {
    photo : Storage.ExternalBlob;
    contentType : Text;
    description : ?Text;
    title : Text;
    category : ItemCategory;
    shapeCategory : Text;
    quantity : Nat;
  };

  let items = Map.empty<Blob, Item>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func bulkUploadItems(itemsInput : [BulkItemInput]) : async [Blob] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload items");
    };

    itemsInput.map(func(item) { createStoreItem(item, caller) });
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform checkout");
    };

    let itemsWithCurrency = items.map(
      func(item) {
        {
          item with 
          currency = "aud";
        };
      }
    );

    await Stripe.createCheckoutSession(
      getStripeConfiguration(),
      caller,
      itemsWithCurrency,
      successUrl,
      cancelUrl,
      transform,
    );
  };

  public query func getItem(id : Blob) : async Item {
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
  };

  func createStoreItem(itemInput : BulkItemInput, creator : Principal) : Blob {
    let description = switch (itemInput.description) {
      case (null) { getDefaultDescription() };
      case (?desc) { desc };
    };
    if (description == "") {
      Runtime.trap("Description must not be empty");
    };

    let item : Item = {
      id = itemInput.photo;
      title = itemInput.title;
      photo = itemInput.photo;
      contentType = itemInput.contentType;
      description;
      priceInCents = 0;
      sold = false;
      published = true;
      createdBy = creator;
      category = itemInput.category;
      shapeCategory = itemInput.shapeCategory;
      quantity = itemInput.quantity;
    };
    items.add(itemInput.photo, item);
    itemInput.photo;
  };

  func getDefaultDescription() : Text {
    "Default description";
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
