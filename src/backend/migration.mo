import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type OldActor = {
    items : Map.Map<Blob, Item>;
    userProfiles : Map.Map<Principal, UserProfile>;
    stripeConfig : ?Stripe.StripeConfiguration;
    baskets : Map.Map<Principal, [Blob]>;
    branding : ?Branding;
    descriptionExamples : [Text];
    itineraries : Map.Map<Text, Itinerary>;
    itineraryCounter : Nat;
    printedItemDescription : Text;
    shapeCategories : Map.Map<Text, ()>;
  };

  type Item = {
    id : Blob;
    photo : Storage.ExternalBlob;
    title : Text;
    contentType : Text;
    description : Text;
    priceInCents : Nat;
    sold : Bool;
    published : Bool;
    createdBy : Principal;
    category : { #printed; #ceramic };
    shapeCategory : Text;
    quantity : Nat;
  };

  type UserProfile = {
    name : Text;
  };

  type Branding = {
    appName : Text;
    logo : Storage.ExternalBlob;
    brandingConfig : BrandingConfig;
    heroMedia : BrandingAsset;
    storefrontHeroText : StorefrontHeroText;
  };

  type BrandingConfig = {
    logoSize : LogoSize;
    showLogo : Bool;
  };

  type StorefrontHeroText = {
    #default;
    #custom : {
      title : Text;
      subtitle : Text;
    };
  };

  type BrandingAsset = {
    blob : Storage.ExternalBlob;
    mediaKind : MediaKind;
    contentType : Text;
  };

  type MediaKind = {
    #image;
    #model3d : { modelType : Text };
  };

  type LogoSize = {
    #small;
    #medium;
    #large;
  };

  type ItemCategory = { #printed; #ceramic };

  type BulkItemInput = {
    photo : Storage.ExternalBlob;
    contentType : Text;
    description : ?Text;
    title : Text;
    category : ItemCategory;
    shapeCategory : Text;
    quantity : Nat;
  };

  type Itinerary = {
    id : Text;
    productRef : Blob;
    startDate : Nat;
    endDate : Nat;
    locations : [Location];
    notes : Text;
  };

  type Location = {
    name : Text;
    address : Text;
    coordinates : ?Coordinates;
    visitDate : Nat;
    description : Text;
  };

  type Coordinates = {
    latitude : Float;
    longitude : Float;
  };

  type NewActor = {
    items : Map.Map<Blob, Item>;
    userProfiles : Map.Map<Principal, UserProfile>;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    {
      items = old.items;
      userProfiles = old.userProfiles;
      stripeConfig = old.stripeConfig;
    };
  };
};
