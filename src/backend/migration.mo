import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import Blob "mo:core/Blob";

module {
  type OldItem = {
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

  type OldBranding = {
    appName : Text;
    logo : Storage.ExternalBlob;
    heroMedia : {
      blob : Storage.ExternalBlob;
      mediaKind : {
        #image;
        #model3d : { modelType : Text };
      };
      contentType : Text;
    };
    storefrontHeroText : {
      #default;
      #custom : { title : Text; subtitle : Text };
    };
  };

  type OldActor = {
    items : Map.Map<Blob, OldItem>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    stripeConfig : ?Stripe.StripeConfiguration;
    branding : ?OldBranding;
    baskets : Map.Map<Principal, [Blob]>;
  };

  type NewItem = {
    id : Blob;
    photo : Storage.ExternalBlob;
    title : Text;
    contentType : Text;
    description : Text;
    priceInCents : Nat;
    sold : Bool;
    published : Bool;
    createdBy : Principal;
    category : {
      #printed;
      #ceramic;
    };
  };

  type NewBranding = {
    appName : Text;
    logo : Storage.ExternalBlob;
    heroMedia : {
      blob : Storage.ExternalBlob;
      mediaKind : {
        #image;
        #model3d : { modelType : Text };
      };
      contentType : Text;
    };
    storefrontHeroText : {
      #default;
      #custom : { title : Text; subtitle : Text };
    };
  };

  type NewActor = {
    items : Map.Map<Blob, NewItem>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    stripeConfig : ?Stripe.StripeConfiguration;
    branding : ?NewBranding;
    baskets : Map.Map<Principal, [Blob]>;
  };

  public func run(old : OldActor) : NewActor {
    let newItems = old.items.map<Blob, OldItem, NewItem>(
      func(_id, item) {
        { item with category = #printed };
      }
    );
    { old with items = newItems };
  };
};
