import Map "mo:core/Map";
import Stripe "stripe/stripe";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  // Old types
  type OldBranding = {
    appName : Text;
    logo : Storage.ExternalBlob;
    heroMedia : BrandAsset;
  };

  type BrandAsset = {
    blob : Storage.ExternalBlob;
    mediaKind : MediaKind;
    contentType : Text;
  };

  type MediaKind = {
    #image;
    #model3d : { modelType : Text };
  };

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
  };

  public type UserProfile = {
    name : Text;
  };

  type OldActor = {
    items : Map.Map<Blob, Item>;
    userProfiles : Map.Map<Principal, UserProfile>;
    stripeConfig : ?Stripe.StripeConfiguration;
    branding : ?OldBranding;
    baskets : Map.Map<Principal, [Blob]>;
    accessControlState : AccessControl.AccessControlState;
  };

  // New types
  type StorefrontHeroText = {
    #default;
    #custom : {
      title : Text;
      subtitle : Text;
    };
  };

  type NewBranding = {
    appName : Text;
    logo : Storage.ExternalBlob;
    heroMedia : BrandAsset;
    storefrontHeroText : StorefrontHeroText;
  };

  type NewActor = {
    items : Map.Map<Blob, Item>;
    userProfiles : Map.Map<Principal, UserProfile>;
    stripeConfig : ?Stripe.StripeConfiguration;
    branding : ?NewBranding;
    baskets : Map.Map<Principal, [Blob]>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let newBranding : ?NewBranding = switch (old.branding) {
      case (null) { null };
      case (?oldBrand) {
        ?{
          oldBrand with
          storefrontHeroText = #default
        };
      };
    };
    {
      old with
      branding = newBranding;
    };
  };
};
