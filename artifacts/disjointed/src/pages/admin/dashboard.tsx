import { useGetProductStats, useGetOrderStats, useListOrders } from "@workspace/api-client-react";
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { AdminPinProtection } from "@/components/admin-pin-protection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: productStats, isLoading: loadingProducts } = useGetProductStats();
  const { data: orderStats, isLoading: loadingOrders } = useGetOrderStats();
  const { data: recentOrders, isLoading: loadingRecent } = useListOrders();

  const StatCard = ({ title, value, icon: Icon, description, trend, loading }: any) => (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="text-2xl font-bold font-mono">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-primary" />}
            {trend === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminPinProtection>
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm">Overview of store performance and pending tasks.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`R${orderStats?.totalRevenue?.toFixed(2) || '0.00'}`} 
            icon={DollarSign} 
            description={`R${orderStats?.todayRevenue?.toFixed(2) || '0.00'} today`}
            trend="up"
            loading={loadingOrders}
          />
          <StatCard 
            title="Pending Orders" 
            value={orderStats?.pendingOrders || 0} 
            icon={Clock} 
            description={`${orderStats?.todayOrders || 0} total orders today`}
            trend={orderStats?.pendingOrders ? "warning" : undefined}
            loading={loadingOrders}
          />
          <StatCard 
            title="Total Products" 
            value={productStats?.totalProducts || 0} 
            icon={Package} 
            description={`${productStats?.availableProducts || 0} currently available`}
            loading={loadingProducts}
          />
          <StatCard 
            title="Low Stock Alerts" 
            value={productStats?.lowStock || 0} 
            icon={AlertTriangle} 
            description="Items with < 5 units"
            trend={productStats?.lowStock ? "warning" : undefined}
            loading={loadingProducts}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="bg-card/50 border-border/50 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/10 pb-4">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 font-mono">Latest activity requiring attention</p>
              </div>
              <Link href="/admin/orders" className="text-sm text-primary hover:underline font-mono uppercase tracking-widest text-xs">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loadingRecent ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono">#{order.id}</span>
                          <span className="text-sm font-medium">{order.customerName || "Guest"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(order.createdAt), "MMM d, h:mm a")} • {order.items.length} items
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold">R{order.total.toFixed(2)}</span>
                        {order.status === 'pending' && <Badge variant="outline" className="bg-yellow-900/30 text-yellow-500 border-yellow-700/50 w-24 justify-center">Pending</Badge>}
                        {order.status === 'ready' && <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 w-24 justify-center">Ready</Badge>}
                        {order.status === 'completed' && <Badge variant="outline" className="bg-muted text-muted-foreground w-24 justify-center">Completed</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground font-mono text-sm">
                  No orders found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminPinProtection>
  );
}