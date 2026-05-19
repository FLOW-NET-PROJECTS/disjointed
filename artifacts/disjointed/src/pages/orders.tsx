import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Search, Clock, ShieldAlert, CheckSquare } from "lucide-react";
import { useGetOrder } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Orders() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialOrderId = searchParams.get("id");
  
  const [searchId, setSearchId] = useState(initialOrderId || "");
  const [activeOrderId, setActiveOrderId] = useState<number | null>(initialOrderId ? parseInt(initialOrderId, 10) : null);

  const { data: order, isLoading, isError } = useGetOrder(activeOrderId!, {
    query: { enabled: !!activeOrderId, queryKey: ["getOrder", activeOrderId] }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId && !isNaN(parseInt(searchId, 10))) {
      setActiveOrderId(parseInt(searchId, 10));
      // Update URL without reload
      window.history.pushState({}, '', `/orders?id=${searchId}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-900/30 text-yellow-500 border-yellow-700/50 uppercase tracking-widest font-mono text-[10px]"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'ready': return <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 uppercase tracking-widest font-mono text-[10px]"><CheckSquare className="w-3 h-3 mr-1" /> Ready for Pickup</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-muted text-muted-foreground border-border uppercase tracking-widest font-mono text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-4">Order Status</h1>
          <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">
            Check the status of your order. Enter your order ID below.
          </p>
          
          <form onSubmit={handleSearch} className="mt-8 flex max-w-sm mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Order ID e.g. 1234" 
                className="pl-10 font-mono bg-card border-r-0 rounded-r-none focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:z-10"
              />
            </div>
            <Button type="submit" className="rounded-l-none font-mono uppercase tracking-widest border border-primary bg-primary text-primary-foreground hover:bg-primary/90">
              Lookup
            </Button>
          </form>
        </div>

        {activeOrderId ? (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isLoading ? (
              <div className="bg-card/50 border border-border/50 rounded-xl p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-32 bg-muted/30" />
                  <Skeleton className="h-6 w-24 bg-muted/30" />
                </div>
                <Separator className="bg-border/30" />
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-6 w-1/2 bg-muted/30" />
                      <Skeleton className="h-6 w-16 bg-muted/30" />
                    </div>
                  ))}
                </div>
                <Separator className="bg-border/30" />
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-6 w-24 bg-muted/30" />
                  <Skeleton className="h-8 w-24 bg-muted/30" />
                </div>
              </div>
            ) : isError || !order ? (
              <div className="bg-card/30 border border-destructive/30 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="w-12 h-12 text-destructive mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Order Not Found</h3>
                <p className="text-muted-foreground font-mono text-sm">We couldn't find an order with ID #{activeOrderId}.</p>
                <p className="text-muted-foreground font-mono text-sm mt-1">Please check your ID and try again.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/20 relative">
                {/* Decorative accent */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  order.status === 'ready' ? 'bg-primary' : 
                  order.status === 'pending' ? 'bg-yellow-500' : 'bg-muted-foreground'
                }`} />
                
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-3">
                        Order #{order.id}
                        {getStatusBadge(order.status)}
                      </h2>
                      <p className="text-muted-foreground font-mono text-xs mt-2 uppercase tracking-widest">
                        Placed {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8 bg-muted/10 p-6 rounded-lg border border-border/30">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">Customer</h3>
                      <p className="font-bold">{order.customerName || "Guest"}</p>
                    </div>
                    {order.customerNote && (
                      <div>
                        <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">Notes</h3>
                        <p className="text-sm italic text-muted-foreground border-l-2 border-primary/50 pl-3">"{order.customerNote}"</p>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-4 pb-2 border-b border-border/50">Items</h3>
                  <div className="space-y-4 mb-8">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 text-center font-mono text-muted-foreground bg-muted/30 rounded-md py-1 text-sm">{item.quantity}x</div>
                          <span className="font-medium group-hover:text-primary transition-colors">{item.productName}</span>
                        </div>
                        <span className="font-mono text-sm">R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-border/50 mb-6" />
                  
                  <div className="space-y-2 font-mono text-sm ml-auto md:w-1/2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>R{order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (15%)</span>
                      <span>R{(order.total * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 border-t border-border/50 text-foreground mt-4">
                      <span>Total Due</span>
                      <span className="text-primary">R{(order.total * 1.15).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {order.status === 'ready' && (
                  <div className="bg-primary/10 border-t border-primary/20 p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-primary mb-1">Your order is ready!</h4>
                      <p className="text-sm text-primary/80 font-mono">Please head to the counter with your ID to pickup and pay.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 bg-card/20 border border-border/30 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-mono text-sm max-w-sm">
              Enter an order ID to view details, track status, and view receipt information.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
