import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { useAuthStore } from "../../store/auth.store";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import { IMAGES } from "../../assets/exports";
import {
  Dumbbell,
  Users,
  Building,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  useUnverifiedOwners,
  useVerifiedOwners,
} from "../../hooks/clubOwner/useClubOwner";
import {
  useClientList,
  useClientCheckins,
} from "../../hooks/client/useClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const username = user?.user?.username || user?.user?.name || "Admin";

  // Real backend queries
  const { verifiedOwners, loading: clubsLoading } = useVerifiedOwners();
  const { unverifiedOwners, loading: requestsLoading } = useUnverifiedOwners(
    "",
    "pending",
  );
  const { clients, loading: usersLoading } = useClientList();
  const { checkins, loading: checkinsLoading } = useClientCheckins();

  useEffect(() => {
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed?.jwt && parsed?.user?.id) {
          setSession(parsed.jwt, parsed.user.id);
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, [rawUser, setSession]);

  // Derived real data
  const clubsThisMonth = useMemo(() => {
    return (verifiedOwners || []).filter((c) =>
      c.createdAt ? dayjs(c.createdAt).isSame(dayjs(), "month") : false,
    ).length;
  }, [verifiedOwners]);

  const activeUsersCount = useMemo(() => {
    return (clients || []).filter((c) => !c.user?.blocked).length;
  }, [clients]);

  const todayCheckinsCount = useMemo(() => {
    return (checkins || []).filter((c) => {
      const time = c.checkinTime || c.createdAt;
      return time ? dayjs(time).isSame(dayjs(), "day") : false;
    }).length;
  }, [checkins]);

  const quickStats = [
    {
      title: "Active Clubs",
      value: (verifiedOwners?.length || 0).toLocaleString(),
      subtext:
        clubsThisMonth > 0
          ? `+${clubsThisMonth} this month`
          : `${verifiedOwners?.length || 0} registered`,
      icon: Building,
      color: "text-blue-600",
      bg: "bg-blue-50",
      link: "/clubs",
      isLoading: clubsLoading,
    },
    {
      title: "Club Requests",
      value: (unverifiedOwners?.length || 0).toLocaleString(),
      subtext:
        unverifiedOwners?.length === 1
          ? "1 pending approval"
          : `${unverifiedOwners?.length || 0} pending approval`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/club-request",
      isLoading: requestsLoading,
    },
    {
      title: "Active Users",
      value: (clients?.length || 0).toLocaleString(),
      subtext:
        clients?.length > 0
          ? `${activeUsersCount} active members`
          : "Fitfob members",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      link: "/users",
      isLoading: usersLoading,
    },
    {
      title: "Today's Check-ins",
      value: todayCheckinsCount.toLocaleString(),
      subtext:
        checkins?.length > 0
          ? `${checkins.length} total logged`
          : "Across partner gyms",
      icon: Dumbbell,
      color: "text-purple-600",
      bg: "bg-purple-50",
      link: "/check-in",
      isLoading: checkinsLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full pb-6">
      {/* Hero Banner with Generated Gym Image */}
      <div className="relative overflow-hidden rounded-2xl border border-divider shadow-sm min-h-[220px] sm:min-h-[260px] flex items-end">
        {/* Background Image */}
        <img
          src={IMAGES.GymBanner}
          alt="Gym Center"
          className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-102 transition duration-700"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

        {/* Content on Image */}
        <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-white max-w-xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="capitalize">{username}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
              Track real-time partner gyms, pending onboarding requests, membership plans, and user check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/club-request")}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-100 font-semibold text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Review Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/clubs")}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs transition border border-white/25 cursor-pointer shrink-0"
            >
              View Clubs
            </button>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <CustomBox
              key={idx}
              customClasses="p-4.5 hover:shadow-md transition cursor-pointer group"
              onClick={() => navigate(item.link)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-secondary-text">
                  {item.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                {item.isLoading ? (
                  <div className="h-8 w-16 bg-gray-200/80 animate-pulse rounded-md" />
                ) : (
                  <span className="text-2xl font-bold text-black tracking-tight">
                    {item.value}
                  </span>
                )}
                {item.isLoading ? (
                  <div className="h-3.5 w-20 bg-gray-100 animate-pulse rounded" />
                ) : (
                  <span className="text-[11px] text-secondary-text">
                    {item.subtext}
                  </span>
                )}
              </div>
            </CustomBox>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

