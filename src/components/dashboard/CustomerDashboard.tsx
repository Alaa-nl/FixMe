"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Button from "@/components/ui/button";
import DisputeCard from "@/components/dispute/DisputeCard";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Wallet,
  FileText,
  Wrench,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface DashboardData {
  activeRequests: any[];
  activeJobs: any[];
  pastJobs: any[];
  disputes?: any[];
  stats: {
    activeRequestCount: number;
    completedCount: number;
    unreadMessages: number;
    moneySaved: number;
  };
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/customer");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16 w-3/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-muted-foreground">Failed to load dashboard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "SCHEDULED":
        return "secondary";
      case "DISPUTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const statCards = [
    {
      icon: FileText,
      value: dashboardData.stats.activeRequestCount,
      label: "Active Requests",
      trend: "+12% this month",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: CheckCircle2,
      value: dashboardData.stats.completedCount,
      label: "Completed",
      trend: "All time",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      icon: MessageSquare,
      value: dashboardData.stats.unreadMessages,
      label: "Unread Messages",
      trend: "Needs attention",
      gradient: "from-accent/20 to-accent/5",
    },
    {
      icon: Wallet,
      value: `€${dashboardData.stats.moneySaved}`,
      label: "Money Saved",
      trend: "Keep fixing!",
      gradient: "from-chart-3/20 to-chart-3/5",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section with atmospheric background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-3xl blur-3xl -z-10" />
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-syne)] text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Here's what's happening with your repairs today
          </p>
        </div>
      </div>

      {/* Stats Grid with glass morphism effect */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-background/80 backdrop-blur-sm">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <div className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground/70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Requests Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold tracking-tight">
            My Active Requests
          </h2>
          {dashboardData.activeRequests.length > 0 && (
            <Link
              href="/my-requests"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group"
            >
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {dashboardData.activeRequests.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold mb-2">
                No active requests yet
              </h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Start your repair journey by posting your first request. Our network of skilled fixers is ready to help!
              </p>
              <Link href="/post">
                <Button variant="primary" size="lg" className="group">
                  Post a Request
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {dashboardData.activeRequests.map((request: any, index: number) => (
              <Link key={request.id} href={`/request/${request.id}`}>
                <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative">
                    <div className="flex gap-6">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden ring-2 ring-background group-hover:ring-primary/50 transition-all">
                          {request.photos.length > 0 ? (
                            <img
                              src={request.photos[0]}
                              alt={request.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {getCategoryIcon(request.category.slug)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold group-hover:text-primary transition-colors">
                            {request.title}
                          </h3>
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="gap-1">
                            <span>{getCategoryIcon(request.category.slug)}</span>
                            <span>{request.category.name}</span>
                          </Badge>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {timeAgo(request.createdAt)}
                          </span>
                          <div className="font-semibold text-primary flex items-center gap-1">
                            <Wrench className="w-4 h-4" />
                            {request._count.offers} {request._count.offers === 1 ? "offer" : "offers"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs Section */}
      {dashboardData.activeJobs.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold tracking-tight">
            Active Jobs
          </h2>

          <div className="grid gap-4">
            {dashboardData.activeJobs.map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="border-2 hover:border-secondary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-14 h-14 ring-2 ring-background group-hover:ring-secondary/50 transition-all">
                          <AvatarImage src={job.fixer?.avatarUrl || "/default-avatar.svg"} alt={job.fixer?.name || "Fixer"} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                            {job.fixer?.name?.charAt(0)?.toUpperCase() || "F"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold">
                            {job.repairRequest.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">Fixer: {job.fixer.name}</p>
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-[family-name:var(--font-syne)] text-3xl font-bold text-primary">
                          €{job.agreedPrice}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Agreed price</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Disputes Section */}
      {dashboardData.disputes && dashboardData.disputes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold tracking-tight">
              Active Disputes
            </h2>
          </div>
          <div className="space-y-4">
            {dashboardData.disputes.map((dispute: any) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        </div>
      )}

      {/* Past Jobs Section */}
      {dashboardData.pastJobs.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold tracking-tight">
              Recent Completions
            </h2>
            <Link
              href="/my-jobs"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group"
            >
              View history
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid gap-3">
            {dashboardData.pastJobs.slice(0, 3).map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {job.repairRequest.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Fixer: {job.fixer.name}
                        </p>
                        {job.reviews.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < job.reviews[0].rating
                                    ? "text-primary"
                                    : "text-muted"
                                }
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              {job.reviews[0].rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">€{job.agreedPrice}</div>
                        <div className="text-xs text-muted-foreground">
                          {timeAgo(job.completedAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
