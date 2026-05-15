import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, CheckSquare } from "lucide-react";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { AdminPinProtection } from "@/components/admin-pin-protection";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AdminOrders() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: orders, isLoading } = useListOrders(
    filter !== "all" ? { status: filter } : undefined
  );
  
  const updateOrder = useUpdateOrder();

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateOrder.mutateAsync({ id, data: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: `Order #${id} marked as ${newStatus}` });
    } catch (error) {
      toast({ title: "Failed to update order", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ready': return <CheckSquare className="w-4 h-4 text-primary" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <AdminPinProtection>
      <AdminLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Orders</h1>
            <p className="text-muted-foreground font-mono text-sm">Manage fulfillment and pickup statuses.</p>
          </div>
          
          <div className="w-48">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="font-mono text-xs uppercase tracking-widest bg-card">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {orders.map((order) => (
              <AccordionItem key={order.id} value={`order-${order.id}`} className="bg-card/50 border border-border/50 rounded-xl overflow-hidden px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-1 items-center justify-between pr-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${
                        order.status === 'ready' ? 'bg-primary' : 
                        order.status === 'pending' ? 'bg-yellow-500' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="flex flex-col items-start text-left">
                        <span className="font-bold font-mono text-lg flex items-center gap-2">
                          #{order.id}
                          {order.status === 'pending' && <Badge variant="outline" className="bg-yellow-900/30 text-yellow-500 border-yellow-700/50 uppercase text-[10px] tracking-widest ml-2">Pending</Badge>}
                          {order.status === 'ready' && <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 uppercase text-[10px] tracking-widest ml-2">Ready</Badge>}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {order.customerName || "Guest"} • {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className="font-mono font-bold">R{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 px-4">
                  <div className="grid md:grid-cols-3 gap-8 pt-4 border-t border-border/30">
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Order Items</h4>
                      <div className="space-y-2 bg-muted/10 p-4 rounded-lg border border-border/30">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm font-mono">
                            <span className="flex items-center gap-3">
                              <span className="text-muted-foreground bg-muted/30 px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                              <span className="text-foreground">{item.productName}</span>
                            </span>
                            <span className="text-muted-foreground">R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.customerNote && (
                        <div>
                          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 mt-4">Customer Notes</h4>
                          <p className="text-sm bg-muted/10 p-3 rounded border-l-2 border-primary/50 text-muted-foreground italic">
                            "{order.customerNote}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Update Status</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleStatusChange(order.id, "pending")}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                            order.status === "pending" 
                              ? "bg-yellow-900/20 border-yellow-700/50 text-yellow-500 font-medium" 
                              : "bg-card border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <Clock className="w-4 h-4" /> Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, "ready")}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                            order.status === "ready" 
                              ? "bg-primary/20 border-primary/40 text-primary font-medium shadow-[0_0_15px_-5px_rgba(74,140,63,0.3)]" 
                              : "bg-card border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <CheckSquare className="w-4 h-4" /> Ready for Pickup
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, "completed")}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                            order.status === "completed" 
                              ? "bg-muted border-muted-foreground/30 text-foreground font-medium" 
                              : "bg-card border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="bg-card/20 border border-border/30 border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground font-mono text-sm">No orders found.</p>
          </div>
        )}
      </AdminLayout>
    </AdminPinProtection>
  );
}