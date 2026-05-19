import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Trash2, ShoppingBag, ChevronLeft, Bell } from "lucide-react";
import { useCreateOrder, useGetVapidPublicKey } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, getCartTotal, getOrderItems, clearCart } = useCart();
  const { status: pushStatus, requestAndSubscribe } = usePushNotifications();
  const { data: vapidData } = useGetVapidPublicKey();
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrder = useCreateOrder();

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0 || !user) {
      return;
    }

    setIsSubmitting(true);

    let customerPushSubscription: {
      endpoint: string;
      expirationTime?: number | null;
      keys: { p256dh: string; auth: string };
    } | undefined;

    if (vapidData?.publicKey && pushStatus !== "denied" && pushStatus !== "unsupported") {
      const subscription = await requestAndSubscribe(vapidData.publicKey);
      if (subscription?.endpoint && subscription?.keys) {
        customerPushSubscription = {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime ?? null,
          keys: {
            p256dh: (subscription.keys as { p256dh: string }).p256dh,
            auth: (subscription.keys as { auth: string }).auth,
          },
        };
      }
    }

    try {
      const order = await createOrder.mutateAsync({
        data: {
          customerName: user.fullName,
          customerNote: customerNote || undefined,
          items: getOrderItems(),
          customerPushSubscription,
        },
      });

      clearCart();
      toast({
        title: "Order placed!",
        description: "We'll notify you when your order is ready for pickup.",
      });
      setLocation(`/orders?id=${order.id}`);
    } catch (error) {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "There was a problem placing your order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
          <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase">Your Stash is Empty</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-md font-mono text-sm">
            Browse our collection of premium flower, edibles, and extracts to start your order.
          </p>
          <Link href="/">
            <Button size="lg" className="font-mono uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Your Stash</h1>
        <p className="text-muted-foreground font-mono text-sm mt-2">
          Review your items before checkout.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card/30 border border-border/50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 text-xs font-mono uppercase tracking-widest text-muted-foreground bg-muted/10 hidden md:grid">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-border/50">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <div className="w-16 h-16 bg-muted/30 rounded border border-border/50 overflow-hidden shrink-0">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <Link href={`/product/${item.id}`} className="font-bold hover:text-primary transition-colors truncate">
                        {item.name}
                      </Link>
                      <div className="flex gap-2 text-xs font-mono text-muted-foreground mt-1">
                        {item.weight && <span>{item.weight}</span>}
                        {item.strain && <span className="uppercase text-primary/70">{item.strain}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 font-mono text-sm w-full md:text-center flex justify-between md:block">
                    <span className="md:hidden text-muted-foreground">Price:</span>
                    R{item.price.toFixed(2)}
                  </div>

                  <div className="col-span-2 flex items-center justify-between md:justify-center w-full md:w-auto border border-border/50 rounded-md bg-background">
                    <button
                      className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="col-span-2 w-full flex items-center justify-between md:justify-end">
                    <div className="font-mono font-bold">
                      <span className="md:hidden text-muted-foreground text-sm font-normal mr-2">Total:</span>
                      R{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 md:ml-4"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link href="/">
              <Button variant="outline" className="font-mono text-xs uppercase tracking-widest">
                <ChevronLeft className="w-3 h-3 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Button variant="ghost" onClick={clearCart} className="text-muted-foreground hover:text-destructive text-sm font-mono">
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 sticky top-24 shadow-lg shadow-black/20">
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wider">Order Summary</h3>

            <div className="space-y-3 font-mono text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (est. 15%)</span>
                <span>R{(total * 0.15).toFixed(2)}</span>
              </div>
              <Separator className="bg-border/50 my-2" />
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>Total</span>
                <span>R{(total * 1.15).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/70">
                  Registered Customer
                </p>
                <div className="text-sm">
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-muted-foreground font-mono">{user?.username}</p>
                  <p className="text-muted-foreground font-mono">ID {user?.idNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Order Notes (Optional)
                </Label>
                <Textarea
                  id="note"
                  value={customerNote}
                  onChange={(event) => setCustomerNote(event.target.value)}
                  placeholder="Any special instructions?"
                  className="bg-background/50 border-border font-mono placeholder:text-muted-foreground/30 min-h-24 resize-none focus-visible:ring-primary"
                />
              </div>

              {pushStatus !== "denied" && pushStatus !== "unsupported" && (
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <Bell className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                    {pushStatus === "subscribed"
                      ? "You'll get a notification when your order is ready."
                      : "Allow notifications so we can ping you when your order is ready for pickup."}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-6 h-12 font-mono uppercase tracking-widest font-bold"
                disabled={isSubmitting || items.length === 0 || !user}
              >
                {isSubmitting ? "Placing order..." : "Place Order"}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center font-mono mt-4 uppercase tracking-wider opacity-70">
                Bring your ID when collecting and paying in store
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
