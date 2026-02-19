import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";

module {
  type ItemCategory = { #printed; #ceramic };

  type Item = {
    id : Blob;
    contentType : Text;
    description : Text;
    photo : Blob;
    priceInCents : Nat;
    published : Bool;
    sold : Bool;
    title : Text;
    category : ItemCategory;
    createdBy : Principal;
  };

  type OldActor = {
    items : Map.Map<Blob, Item>;
    stripeConfig : ?Stripe.StripeConfiguration;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    items : Map.Map<Blob, Item>;
    stripeConfig : ?Stripe.StripeConfiguration;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let newItems = old.items.map<Blob, Item, Item>(
      func(_id, item) {
        switch (item.category) {
          case (#printed) { { item with priceInCents = 900 } };
          case (#ceramic) { { item with priceInCents = 1900 } };
        };
      }
    );
    { old with items = newItems };
  };
};
