import Map "mo:core/Map";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";

module {
  type OldActor = {
    items : Map.Map<Blob, {
      id : Blob;
      photo : Storage.ExternalBlob;
      title : Text;
      contentType : Text;
      description : Text;
      priceInCents : Nat;
      sold : Bool;
      published : Bool;
      createdBy : Principal;
    }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    stripeConfig : ?Stripe.StripeConfiguration;
    branding : ?{
      appName : Text;
      logo : Storage.ExternalBlob;
      heroMedia : {
        blob : Storage.ExternalBlob;
        mediaKind : { #image; #model3d : { modelType : Text } };
        contentType : Text;
      };
      storefrontHeroText : {
        #default;
        #custom : {
          title : Text;
          subtitle : Text;
        };
      };
    };
    baskets : Map.Map<Principal, [Blob]>;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
