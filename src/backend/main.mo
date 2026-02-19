import Map "mo:core/Map";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import MixinStorage "blob-storage/Mixin";
import List "mo:core/List";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";



actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ItemCategory = { #printed; #ceramic };

  public type Item = {
    id : Blob;
    photo : Storage.ExternalBlob;
    title : Text;
    contentType : Text;
    description : Text;
    priceInCents : Nat;
    sold : Bool;
    published : Bool;
    createdBy : Principal;
    category : ItemCategory;
    shapeCategory : Text;
  };

  public type MediaKind = {
    #image;
    #model3d : { modelType : Text }; // e.g. "glb", "gltf" etc.
  };

  public type BrandingAsset = {
    blob : Storage.ExternalBlob;
    mediaKind : MediaKind;
    contentType : Text;
  };

  public type StorefrontHeroText = {
    #default;
    #custom : {
      title : Text;
      subtitle : Text;
    };
  };

  public type Branding = {
    appName : Text;
    logo : Storage.ExternalBlob;
    heroMedia : BrandingAsset;
    storefrontHeroText : StorefrontHeroText;
  };

  public type UserProfile = {
    name : Text;
    // Add other user metadata if needed
  };

  public type StorefrontItems = {
    items : [Item];
    headerAsset : BrandingAsset;
    heroText : StorefrontHeroText;
  };

  public type BulkItemInput = {
    photo : Storage.ExternalBlob;
    contentType : Text;
    description : ?Text;
    title : Text;
    category : ItemCategory;
    shapeCategory : Text;
  };

  let descriptionExamples = [
    "A beautiful handcrafted ceramic instrument with a unique pattern and glossy finish.",
    "This sleek instrument features a blue glaze reminiscent of oceanic waves.",
    "The intricate designs carved on this item make it a true collector's gem.",
    "A perfect blend of functionality and art, this piece delivers exceptional utility.",
    "Inspired by ancient wind instruments, this design boasts timeless craftsmanship.",
  ];

  let shapeCategories = Map.empty<Text, ()>();
  let items = Map.empty<Blob, Item>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;
  var branding : ?Branding = null;
  let baskets = Map.empty<Principal, [Blob]>();

  let printedItemDescription = "Expertly crafted 3D printed product with clean layer lines and precision detailing. Lightweight material ensures durability without compromising on structural integrity. Ideal for both functional use and display, showcasing the advanced capabilities of modern additive manufacturing. Finished with a professional touch for superior aesthetic appeal. Perfect for collectors and creators seeking high-quality, customizable items.";

  public shared ({ caller }) func addToBasket(itemId : Blob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add to basket");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.sold) {
          Runtime.trap("Item is already sold");
        };
        let currentBasket = switch (baskets.get(caller)) {
          case (null) { [] };
          case (?basket) { basket };
        };

        baskets.add(caller, currentBasket.concat([itemId]));
      };
    };
  };

  public shared ({ caller }) func removeFromBasket(itemId : Blob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove from basket");
    };

    switch (baskets.get(caller)) {
      case (null) { Runtime.trap("Basket is empty") };
      case (?basket) {
        baskets.add(caller, basket.filter(func(id) { id != itemId }));
      };
    };
  };

  public query ({ caller }) func getBasket() : async {
    itemIds : [Blob];
    items : [Item];
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view basket");
    };

    let itemIds = switch (baskets.get(caller)) {
      case (null) { [] };
      case (?basket) { basket };
    };

    let itemList = itemIds.map(func(id) { switch (items.get(id)) { case (?item) { item }; case (null) { Runtime.trap("Item not found") } } });
    { itemIds; items = itemList };
  };

  public shared ({ caller }) func clearBasket() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can clear basket");
    };
    baskets.remove(caller);
  };

  public shared ({ caller }) func createCheckoutSessionFromBasket(
    successUrl : Text,
    cancelUrl : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform checkout");
    };

    switch (baskets.get(caller)) {
      case (null) { Runtime.trap("Basket is empty") };
      case (?basket) {
        if (basket.size() == 0) {
          Runtime.trap("Basket is empty");
        };

        let itemsForCheckout = basket.map(
          func(itemId) {
            switch (items.get(itemId)) {
              case (null) { Runtime.trap("Item not found") };
              case (?item) {
                if (item.sold) {
                  Runtime.trap("Item is already sold");
                };
                {
                  currency = "aud";
                  productName = item.title;
                  productDescription = item.description;
                  priceInCents = item.priceInCents;
                  quantity = 1;
                };
              };
            };
          }
        );

        await Stripe.createCheckoutSession(
          getStripeConfiguration(),
          caller,
          itemsForCheckout,
          successUrl,
          cancelUrl,
          transform,
        );
      };
    };
  };

  public shared ({ caller }) func publishItems(itemIds : [Blob]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can publish items");
    };

    itemIds.forEach(
      func(id) {
        switch (items.get(id)) {
          case (null) { Runtime.trap("Item not found") };
          case (?item) {
            let updatedItem = { item with published = true };
            items.add(id, updatedItem);
          };
        };
      }
    );
  };

  public shared ({ caller }) func unpublishItems(itemIds : [Blob]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can unpublish items");
    };

    itemIds.forEach(
      func(id) {
        switch (items.get(id)) {
          case (null) { Runtime.trap("Item not found") };
          case (?item) {
            let updatedItem = { item with published = false };
            items.add(id, updatedItem);
          };
        };
      }
    );
  };

  public shared ({ caller }) func markItemsAsSold(itemIds : [Blob]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can mark items as sold");
    };

    itemIds.forEach(
      func(id) {
        switch (items.get(id)) {
          case (null) { Runtime.trap("Item not found") };
          case (?item) {
            let updatedItem = { item with sold = true };
            items.add(id, updatedItem);
          };
        };
      }
    );
  };

  public shared ({ caller }) func updateAllPrintedItemDescriptions(newDescription : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update item descriptions");
    };

    if (newDescription == "") {
      Runtime.trap("Description must not be empty");
    };

    for ((id, item) in items.entries()) {
      if (item.category == #printed) {
        let updatedItem = { item with description = newDescription };
        items.add(id, updatedItem);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  public shared ({ caller }) func setItemPrice(itemId : Blob, priceInCents : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set item prices");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem = { item with priceInCents };
        items.add(itemId, updatedItem);
      };
    };
  };

  public shared ({ caller }) func updateAllItemPricesByCategory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for ((id, item) in items.entries()) {
      let updatedItem = switch (item.category) {
        case (#printed) { { item with priceInCents = 900 } };
        case (#ceramic) { { item with priceInCents = 1900 } };
      };
      items.add(id, updatedItem);
    };
  };

  public query ({ caller }) func getBranding() : async ?Branding {
    branding;
  };

  public shared ({ caller }) func setBranding(brand : Branding) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set branding");
    };
    branding := ?brand;
  };

  public query func getStorefrontHeroText() : async StorefrontHeroText {
    switch (branding) {
      case (null) { #default };
      case (?brand) { brand.storefrontHeroText };
    };
  };

  public shared ({ caller }) func updateItemDescription(itemId : Blob, newDescription : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update item descriptions");
    };
    if (newDescription == "") {
      Runtime.trap("Description must not be empty");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem = { item with description = newDescription };
        items.add(itemId, updatedItem);
      };
    };
  };

  public shared ({ caller }) func updateItemPhoto(itemId : Blob, newPhoto : Storage.ExternalBlob, newContentType : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update item photos");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem = { item with photo = newPhoto; contentType = newContentType };
        items.add(itemId, updatedItem);
      };
    };
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

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func getItem(id : Blob) : async Item {
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
  };

  public query func getItemsByCategory(category : ItemCategory) : async [Item] {
    let filteredItems = List.empty<Item>();

    for ((_, item) in items.entries()) {
      if (item.category == category) {
        filteredItems.add(item);
      };
    };

    filteredItems.toArray();
  };

  public query func getItems() : async [Item] {
    items.values().toArray();
  };

  public query ({ caller }) func getStorefrontItems() : async ?StorefrontItems {
    let publishedItems = items.values().toArray().filter(func(item) { item.published });
    switch (branding) {
      case (null) { null };
      case (?brand) {
        ?{
          items = publishedItems;
          headerAsset = brand.heroMedia;
          heroText = brand.storefrontHeroText;
        };
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
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
    };
    items.add(itemInput.photo, item);
    itemInput.photo;
  };

  func getDefaultDescription() : Text {
    descriptionExamples[0];
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  // Shape category management functions - Admin only
  public query func getShapeCategories() : async [Text] {
    shapeCategories.keys().toArray();
  };

  public shared ({ caller }) func addShapeCategory(category : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add shape categories");
    };

    if (category == "") {
      Runtime.trap("Category name must not be empty");
    };

    if (shapeCategories.containsKey(category)) {
      Runtime.trap("Category already exists");
    };

    shapeCategories.add(category, ());
  };

  public shared ({ caller }) func renameShapeCategory(oldName : Text, newName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can rename shape categories");
    };

    if (newName == "") {
      Runtime.trap("Category name must not be empty");
    };

    if (not shapeCategories.containsKey(oldName)) {
      Runtime.trap("Original category does not exist");
    };

    if (shapeCategories.containsKey(newName)) {
      Runtime.trap("Category already exists");
    };

    shapeCategories.add(newName, ());
    shapeCategories.remove(oldName);

    for ((id, item) in items.entries()) {
      if (Text.equal(item.shapeCategory, oldName)) {
        let updatedItem = { item with shapeCategory = newName };
        items.add(id, updatedItem);
      };
    };
  };
};
