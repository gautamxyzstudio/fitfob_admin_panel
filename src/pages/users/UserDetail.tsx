/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import {
  useClientDetail,
  useUserCheckinDetails,
  useUserGymMemberships,
  useUserTrials,
} from "../../hooks/client/useClient";
import { IMAGES } from "../../assets/exports";
import {
  toLocalDate,
  formatLocalDate,
  formatLocalTime,
  formatLocalDateTime,
} from "../../utility/dayjs";
import {
  FileDownload,
  ReceiptLong,
} from "@mui/icons-material";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle,
  XCircle,
  Dumbbell,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import UserActivityLogs from "../../components/modules/userLogs/UserActivityLogs";

type UserDetailTab = "memberships" | "checkins" | "trials";

const formatPlanName = (plan?: string): string => {
  if (!plan) return "Standard Plan";
  const p = plan.toLowerCase().trim();
  if (p === "six_months" || p === "sixmonths" || p === "6months") return "6 Months";
  if (p === "one_month" || p === "monthly" || p === "1month") return "Monthly";
  if (p === "one_year" || p === "annual" || p === "yearly" || p === "12months") return "Annual (12 Months)";
  if (p === "three_months" || p === "quarterly") return "3 Months";
  return plan.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatAmount = (amount?: number | string): string => {
  if (amount === undefined || amount === null) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString("en-IN")}`;
};

const getPeriodStatus = (fromStr: string, toStr: string) => {
  const now = toLocalDate().startOf("day");
  const from = toLocalDate(fromStr).startOf("day");
  const end = toLocalDate(toStr).endOf("day");

  if (!from.isValid() || !end.isValid()) {
    return { label: "Trial Window", bg: "bg-gray-100 text-gray-600 border-gray-200" };
  }

  if (now.isBefore(from)) {
    return { label: "Upcoming Period", bg: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  if (now.isAfter(end)) {
    return { label: "Completed Period", bg: "bg-gray-100 text-gray-600 border-gray-200" };
  }
  return { label: "Active Period", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
};

const getTrialStatusBadge = (status?: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "cancelled" || s === "canceled") {
    return {
      label: "Cancelled",
      bg: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      icon: XCircle,
    };
  }
  if (s === "no-show" || s === "noshow") {
    return {
      label: "No-Show",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: AlertCircle,
    };
  }
  if (s === "active" || s === "confirmed" || s === "booked") {
    return {
      label: "Active / Booked",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }
  if (s === "completed" || s === "attended") {
    return {
      label: "Completed",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      icon: CheckCircle2,
    };
  }
  return {
    label: status ? status.toUpperCase() : "SCHEDULED",
    bg: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    icon: Clock,
  };
};

const UserDetail = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { client, loading: clientLoading } = useClientDetail(docId);

  const effectiveDocId = client?.documentId || docId || "";

  // Active Tab state
  const [activeTab, setActiveTab] = useState<UserDetailTab>("memberships");

  // 1. Gym Memberships API (/api/gym-memberships/:docId)
  const {
    memberships,
    loading: membershipsLoading,
    isFetching: membershipsFetching,
    refetch: refetchMemberships,
  } = useUserGymMemberships(effectiveDocId);

  // 2. User Check-ins API (/api/checkin/:docId)
  const {
    checkins: apiCheckins,
    loading: checkinsLoading,
    isFetching: checkinsFetching,
    refetch: refetchCheckins,
  } = useUserCheckinDetails(effectiveDocId);

  // 3. User Trials API (/api/trials/:docId)
  const {
    trialPeriods,
    loading: trialsLoading,
    isFetching: trialsFetching,
    refetch: refetchTrials,
  } = useUserTrials(effectiveDocId);

  // Pagination states
  const [membershipPage, setMembershipPage] = useState<number>(0);
  const membershipRowsPerPage = 5;

  const [checkinPage, setCheckinPage] = useState<number>(0);
  const checkinRowsPerPage = 10;

  const [trialsPage, setTrialsPage] = useState<number>(0);
  const trialsRowsPerPage = 5;

  // Normalized memberships list (with fallback to client.local_subscriptions if API returns empty)
  const resolvedMemberships = useMemo(() => {
    if (memberships && memberships.length > 0) {
      return memberships;
    }
    const subs = client?.local_subscriptions;
    if (subs && subs.length > 0) {
      return subs.map((sub: any, idx: number) => ({
        membershipId: sub.documentId || `MEM-${sub.id || idx + 1}`,
        clubName: sub.club_owner?.clubName || "Club Partner",
        plan: sub.local_membership_plan?.planName || "Standard",
        amount: sub.local_membership_plan?.price || 0,
        membershipStatus: sub.subscriptionStatus || "active",
        startDate: sub.startDate || client?.createdAt || "",
        endDate: sub.endDate || sub.startDate || client?.createdAt || "",
        paymentMethod: sub.paymentMethod || "UPI",
      }));
    }
    return [];
  }, [memberships, client]);

  // Paginated memberships
  const totalMembershipPages = Math.max(1, Math.ceil(resolvedMemberships.length / membershipRowsPerPage));
  const safeMembershipPage = Math.min(Math.max(0, membershipPage), totalMembershipPages - 1);
  const paginatedMemberships = useMemo(() => {
    const start = safeMembershipPage * membershipRowsPerPage;
    return resolvedMemberships.slice(start, start + membershipRowsPerPage);
  }, [resolvedMemberships, safeMembershipPage]);

  // Normalized check-ins list (API check-ins prioritized, fallback to client.client_checkins)
  const resolvedCheckins = useMemo(() => {
    if (apiCheckins && apiCheckins.length > 0) {
      return [...apiCheckins].sort(
        (a, b) => toLocalDate(b.checkinTime).valueOf() - toLocalDate(a.checkinTime).valueOf(),
      );
    }
    const chks = client?.client_checkins;
    if (chks && chks.length > 0) {
      return chks.map((chk: any) => ({
        clubName: chk.clubName || chk.club_owner?.clubName || "Partner Club",
        checkinType: chk.subscriptionType || null,
        checkinTime: chk.checkinTime || chk.createdAt || "",
        createdAt: chk.createdAt || chk.checkinTime || "",
      }));
    }
    return [];
  }, [apiCheckins, client]);

  // Paginated check-ins
  const totalCheckinPages = Math.max(1, Math.ceil(resolvedCheckins.length / checkinRowsPerPage));
  const safeCheckinPage = Math.min(Math.max(0, checkinPage), totalCheckinPages - 1);
  const paginatedCheckins = useMemo(() => {
    const start = safeCheckinPage * checkinRowsPerPage;
    return resolvedCheckins.slice(start, start + checkinRowsPerPage);
  }, [resolvedCheckins, safeCheckinPage, checkinRowsPerPage]);

  // Paginated trial periods
  const totalTrialsCount = useMemo(() => {
    return trialPeriods.reduce((acc, p) => acc + (p.Trials?.length || 0), 0);
  }, [trialPeriods]);

  const totalTrialPages = Math.max(1, Math.ceil(trialPeriods.length / trialsRowsPerPage));
  const safeTrialPage = Math.min(Math.max(0, trialsPage), totalTrialPages - 1);
  const paginatedTrialPeriods = useMemo(() => {
    const start = safeTrialPage * trialsRowsPerPage;
    return trialPeriods.slice(start, start + trialsRowsPerPage);
  }, [trialPeriods, safeTrialPage, trialsRowsPerPage]);

  if (clientLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6 bg-white rounded-xl w-full">
        <ActivityIndicator size={80} />
      </div>
    );
  }

  const avatar = client?.selfieUpload || IMAGES.DummyPROFILE;
  const isBlocked = client?.user?.blocked === true;
  const isActive = !isBlocked;

  // Derive location
  const location =
    client?.location ||
    (client?.local_subscriptions?.[0]?.club_owner?.clubAddress
      ? `${client.local_subscriptions[0].club_owner.clubAddress}`
      : client?.local_subscriptions?.[0]?.club_owner?.city
        ? `${client.local_subscriptions[0].club_owner.city}, ${client.local_subscriptions[0].club_owner.state}`
        : "Faridabad, India");

  // Format dates
  const signUpDate = client?.createdAt
    ? formatLocalDate(client.createdAt, "DD/MM/YYYY")
    : "10/02/2025";
  const dateOfBirth = client?.date_of_birth
    ? formatLocalDate(client.date_of_birth, "DD/MM/YYYY")
    : "18/01/2001";

  const isCurrentTabFetching =
    activeTab === "memberships"
      ? membershipsFetching
      : activeTab === "checkins"
        ? checkinsFetching
        : trialsFetching;

  const handleRefreshCurrentTab = () => {
    if (activeTab === "memberships") refetchMemberships();
    if (activeTab === "checkins") refetchCheckins();
    if (activeTab === "trials") refetchTrials();
  };

  return (
    <div className="flex w-full flex-col gap-y-4 pb-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm gap-1 text-secondary-text">
        <span
          onClick={() => navigate("/users")}
          className="cursor-pointer hover:underline text-secondary-text"
        >
          All Users List
        </span>
        <span className="mx-1">&gt;</span>
        <span className="font-semibold text-black">User Detail Page</span>
      </div>

      {/* Profile Header Card */}
      <CustomBox customClasses="p-5 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-x-4">
          <img
            src={avatar}
            alt={client?.name || "User Avatar"}
            className="w-18 h-18 rounded-2xl object-cover border border-gray-100 shadow-xs"
          />
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-row items-center gap-x-3">
              <h2 className="text-xl font-bold text-black capitalize">
                {client?.name || "David Lee"}
              </h2>
              <span
                className={`px-3 py-0.5 text-xs rounded-[52px] font-medium capitalize ${
                  isActive
                    ? "bg-lightGreen text-green"
                    : "bg-[#E5E7EB] text-[#4B5563]"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <span className="text-sm text-secondary-text">
              {client?.email || "davidlee@gmail.com"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-x-3.5">
          <CustomButton
            buttonStyle="white"
            label="Edit"
            customStyles="px-8 py-2 rounded-lg font-medium text-sm text-secondary-text border border-divider shadow-xs hover:bg-gray-50!"
            onClick={() => navigate(`/users/edit/${docId}`)}
          />
        </div>
      </CustomBox>

      {/* Account Information Card */}
      <CustomBox customClasses="p-5 flex flex-col gap-y-4">
        <h3 className="text-base font-semibold text-black">
          Account Information
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-6">
          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Name</span>
            <span className="text-sm font-medium text-black capitalize">
              {client?.name || "David Lee"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Email</span>
            <span className="text-sm font-medium text-black">
              {client?.email || "davidlee@gmail.com"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Phone</span>
            <span className="text-sm font-medium text-black">
              {client?.phoneNumber || "+91 91234-56789"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Account No:</span>
            <span className="text-sm font-medium text-black">
              {client?.clientId || "FTB-ACC-000234"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Location</span>
            <span className="text-sm font-medium text-black">{location}</span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Sign Up Date</span>
            <span className="text-sm font-medium text-black">{signUpDate}</span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Status</span>
            <span className="text-sm font-medium text-black capitalize">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">Date of Birth</span>
            <span className="text-sm font-medium text-black">{dateOfBirth}</span>
          </div>
        </div>
      </CustomBox>

      {/* Unified Tabbed Section: Memberships, Checkins & Trials */}
      <CustomBox customClasses="p-5 flex flex-col gap-y-4">
        {/* Tab Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl w-fit flex-wrap">
            {/* Tab 1: Memberships */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("memberships");
                setMembershipPage(0);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "memberships"
                  ? "bg-white text-primary shadow-xs"
                  : "text-secondary-text hover:text-black"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Gym Memberships</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "memberships"
                    ? "bg-red-50 text-primary"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {resolvedMemberships.length}
              </span>
            </button>

            {/* Tab 2: Check-ins */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("checkins");
                setCheckinPage(0);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "checkins"
                  ? "bg-white text-primary shadow-xs"
                  : "text-secondary-text hover:text-black"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check-in History</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "checkins"
                    ? "bg-red-50 text-primary"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {resolvedCheckins.length}
              </span>
            </button>

            {/* Tab 3: Trials */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("trials");
                setTrialsPage(0);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "trials"
                  ? "bg-white text-primary shadow-xs"
                  : "text-secondary-text hover:text-black"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Trials</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "trials"
                    ? "bg-red-50 text-primary"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {trialPeriods.length} {trialPeriods.length === 1 ? "Period" : "Periods"}
              </span>
            </button>
          </div>

          {/* Quick Refresh Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRefreshCurrentTab}
              disabled={isCurrentTabFetching}
              title="Refresh tab data"
              className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 text-secondary-text hover:text-black transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isCurrentTabFetching ? "animate-spin text-primary" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MEMBERSHIPS CONTENT */}
        {activeTab === "memberships" && (
          <div className="w-full flex flex-col gap-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-black">Active & Past Gym Memberships</h4>
                <p className="text-xs text-secondary-text mt-0.5">
                  Memberships purchased by this user across partner fitness clubs.
                </p>
              </div>
            </div>

            {membershipsLoading && resolvedMemberships.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
                <ActivityIndicator size={36} />
                <p className="text-xs text-secondary-text mt-3">Loading gym memberships...</p>
              </div>
            ) : resolvedMemberships.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-primary mb-2">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-black">No Memberships Found</p>
                <p className="text-xs text-secondary-text mt-1 max-w-sm">
                  This user currently does not have any recorded gym memberships.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-xl border border-divider">
                <table className="w-full text-left text-sm border-collapse min-w-160">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider font-semibold">
                      <th className="py-3 px-4">Membership ID</th>
                      <th className="py-3 px-4">Club Name</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Validity Period</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedMemberships.map((sub: any, idx: number) => {
                      const isSubActive =
                        sub.membershipStatus === "active" ||
                        sub.membershipStatus === "Active";
                      const transId = sub.membershipId || `MEM-${sub.id || idx + 1}`;
                      const planLabel = formatPlanName(sub.plan);
                      const amountStr = formatAmount(sub.amount);
                      const startStr = sub.startDate
                        ? formatLocalDate(sub.startDate, "DD/MM/YYYY")
                        : "-";
                      const endStr = sub.endDate
                        ? formatLocalDate(sub.endDate, "DD/MM/YYYY")
                        : "-";

                      return (
                        <tr
                          key={transId + idx}
                          className="hover:bg-gray-50/60 transition"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs font-semibold bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md text-gray-800">
                              {transId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-black">
                            <div className="flex items-center gap-1.5">
                              <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{sub.clubName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-black font-medium">
                            {planLabel}
                          </td>
                          <td className="py-3.5 px-4 text-black font-semibold">
                            {amountStr}
                          </td>
                          <td className="py-3.5 px-4 text-secondary-text text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-secondary-text shrink-0" />
                              <span>
                                {startStr} — {endStr}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                                isSubActive
                                  ? "bg-lightGreen text-green border-emerald-200"
                                  : "bg-[#FEE2E2] text-[#EF4444] border-red-200"
                              }`}
                            >
                              {sub.membershipStatus || (isSubActive ? "Active" : "Expired")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Memberships Pagination */}
            {resolvedMemberships.length > membershipRowsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-divider">
                <span className="text-secondary-text text-xs">
                  Showing {safeMembershipPage * membershipRowsPerPage + 1} -{" "}
                  {Math.min(
                    (safeMembershipPage + 1) * membershipRowsPerPage,
                    resolvedMemberships.length,
                  )}{" "}
                  of {resolvedMemberships.length} memberships
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMembershipPage((prev) => Math.max(prev - 1, 0))}
                    disabled={safeMembershipPage === 0}
                    className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs px-2 font-medium text-black">
                    Page {safeMembershipPage + 1} of {totalMembershipPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setMembershipPage((prev) =>
                        Math.min(prev + 1, totalMembershipPages - 1),
                      )
                    }
                    disabled={safeMembershipPage >= totalMembershipPages - 1}
                    className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHECK-INS CONTENT */}
        {activeTab === "checkins" && (
          <div className="w-full flex flex-col gap-y-3">
            <div>
              <h4 className="text-sm font-bold text-black">Check-in Records</h4>
              <p className="text-xs text-secondary-text mt-0.5">
                Physical entry logs when the user scans or checks into a club.
              </p>
            </div>

            {checkinsLoading && resolvedCheckins.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
                <ActivityIndicator size={36} />
                <p className="text-xs text-secondary-text mt-3">Loading check-in history...</p>
              </div>
            ) : resolvedCheckins.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-black">No Check-ins Recorded</p>
                <p className="text-xs text-secondary-text mt-1 max-w-sm">
                  This user has not checked into any fitness club yet.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-xl border border-divider">
                <table className="w-full text-left text-sm border-collapse min-w-140">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider font-semibold">
                      <th className="py-3 px-4">Club Name</th>
                      <th className="py-3 px-4">Pass Type</th>
                      <th className="py-3 px-4">Check-in Date</th>
                      <th className="py-3 px-4">Check-in Time</th>
                      <th className="py-3 px-4">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedCheckins.map((chk: any, idx: number) => {
                      const dateStr = chk.checkinTime
                        ? formatLocalDate(chk.checkinTime, "DD MMM YYYY")
                        : "-";
                      const timeStr = chk.checkinTime
                        ? formatLocalTime(chk.checkinTime, "hh:mm A")
                        : "-";
                      const createdStr = chk.createdAt
                        ? formatLocalDateTime(chk.createdAt, "DD/MM/YYYY, hh:mm A")
                        : "-";

                      const isMembershipType =
                        chk.checkinType === "membership" ||
                        String(chk.checkinType || "").toLowerCase().includes("member");
                      const isTrialType =
                        chk.checkinType === "trial" ||
                        String(chk.checkinType || "").toLowerCase().includes("trial");

                      return (
                        <tr
                          key={chk.checkinTime + idx}
                          className="hover:bg-gray-50/60 transition"
                        >
                          <td className="py-3.5 px-4 font-semibold text-black">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{chk.clubName || "Fitness Club"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                isMembershipType
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : isTrialType
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isMembershipType
                                    ? "bg-purple-500"
                                    : isTrialType
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                }`}
                              />
                              {isMembershipType
                                ? "Membership Pass"
                                : isTrialType
                                  ? "Free Trial Pass"
                                  : "Standard Check-in"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-black font-medium text-xs">
                            {dateStr}
                          </td>
                          <td className="py-3.5 px-4 text-black font-semibold text-xs">
                            <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-secondary-text" />
                              <span>{timeStr}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-secondary-text text-xs">
                            {createdStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Check-ins Pagination */}
            {resolvedCheckins.length > checkinRowsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-divider">
                <span className="text-secondary-text text-xs">
                  Showing {safeCheckinPage * checkinRowsPerPage + 1} -{" "}
                  {Math.min(
                    (safeCheckinPage + 1) * checkinRowsPerPage,
                    resolvedCheckins.length,
                  )}{" "}
                  of {resolvedCheckins.length} check-ins
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCheckinPage((prev) => Math.max(prev - 1, 0))}
                    disabled={safeCheckinPage === 0}
                    className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs px-2 font-medium text-black">
                    Page {safeCheckinPage + 1} of {totalCheckinPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCheckinPage((prev) => Math.min(prev + 1, totalCheckinPages - 1))
                    }
                    disabled={safeCheckinPage >= totalCheckinPages - 1}
                    className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRIALS CONTENT */}
        {activeTab === "trials" && (
          <div className="w-full flex flex-col gap-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-black">Trial Periods & Bookings</h4>
                <p className="text-xs text-secondary-text mt-0.5">
                  1-Day free trial passes claimed across defined trial windows (From &mdash; To).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-primary border border-primary/20">
                  {totalTrialsCount} Total {totalTrialsCount === 1 ? "Trial" : "Trials"}
                </span>
              </div>
            </div>

            {trialsLoading && trialPeriods.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
                <ActivityIndicator size={36} />
                <p className="text-xs text-secondary-text mt-3">Loading trial periods...</p>
              </div>
            ) : trialPeriods.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-bg/40 rounded-xl border border-dashed border-divider">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-black">No Trial Records Found</p>
                <p className="text-xs text-secondary-text mt-1 max-w-sm">
                  This user has not claimed or booked any free gym trials.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-y-4">
                {paginatedTrialPeriods.map((period, pIdx) => {
                  const periodStatus = getPeriodStatus(period.from, period.to);
                  const fromFormatted = formatLocalDate(period.from, "DD MMM YYYY");
                  const toFormatted = formatLocalDate(period.to, "DD MMM YYYY");
                  const periodTrials = period.Trials || [];

                  return (
                    <div
                      key={period.from + period.to + pIdx}
                      className="border border-gray-200/90 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs hover:shadow-xs transition"
                    >
                      {/* Period Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-primary shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs text-secondary-text font-medium block">
                              Trial Period Window
                            </span>
                            <span className="text-sm font-bold text-black tracking-tight">
                              {fromFormatted} &mdash; {toFormatted}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${periodStatus.bg}`}
                          >
                            {periodStatus.label}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {periodTrials.length}{" "}
                            {periodTrials.length === 1 ? "Booking" : "Bookings"}
                          </span>
                        </div>
                      </div>

                      {/* Nested Trials inside Period */}
                      <div className="pt-3.5">
                        {periodTrials.length === 0 ? (
                          <div className="py-4 text-center text-xs text-secondary-text bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No club trial bookings in this period.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm border-collapse min-w-130">
                              <thead>
                                <tr className="bg-[#F9FAFB] text-secondary-text text-[11px] font-semibold border-b border-gray-100 uppercase tracking-wider">
                                  <th className="py-2.5 px-3.5">Club Name</th>
                                  <th className="py-2.5 px-3.5">Trial Date</th>
                                  <th className="py-2.5 px-3.5">Pass Type</th>
                                  <th className="py-2.5 px-3.5">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {periodTrials.map((tr, tIdx) => {
                                  const statusBadge = getTrialStatusBadge(tr.trialstatus);
                                  const formattedTrialDate = formatLocalDate(
                                    tr.trialDate,
                                    "DD MMM YYYY",
                                  );

                                  return (
                                    <tr
                                      key={tr.clubName + tr.trialDate + tIdx}
                                      className="hover:bg-gray-50/50 transition text-xs"
                                    >
                                      <td className="py-3 px-3.5 font-semibold text-black">
                                        <div className="flex items-center gap-1.5">
                                          <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                                          <span>{tr.clubName}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-3.5 text-black font-medium">
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3 h-3 text-secondary-text" />
                                          <span>{formattedTrialDate}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-3.5 text-secondary-text">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium border border-gray-200">
                                          1-Day Free Pass
                                        </span>
                                      </td>
                                      <td className="py-3 px-3.5">
                                        <span
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.bg}`}
                                        >
                                          <span
                                            className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}
                                          />
                                          {statusBadge.label}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trials Pagination */}
            {trialPeriods.length > trialsRowsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-divider">
                <span className="text-secondary-text text-xs">
                  Showing {safeTrialPage * trialsRowsPerPage + 1} -{" "}
                  {Math.min(
                    (safeTrialPage + 1) * trialsRowsPerPage,
                    trialPeriods.length,
                  )}{" "}
                  of {trialPeriods.length} trial periods
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTrialsPage((prev) => Math.max(prev - 1, 0))}
                    disabled={safeTrialPage === 0}
                    className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs px-2 font-medium text-black">
                    Page {safeTrialPage + 1} of {totalTrialPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTrialsPage((prev) => Math.min(prev + 1, totalTrialPages - 1))
                    }
                    disabled={safeTrialPage >= totalTrialPages - 1}
                    className="p-1.5 rounded-lg border border-divider hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </CustomBox>

      {/* User Activity Logs */}
      <UserActivityLogs docId={client?.documentId || docId} clientName={client?.name} />

      {/* Bottom Action Buttons */}
      <div className="flex flex-row gap-x-4 w-full pt-1">
        <button
          onClick={() => { }}
          className="flex-1 bg-white hover:bg-gray-50 border border-divider shadow-xs py-3.5 rounded-xl flex items-center justify-center gap-x-2 text-sm font-semibold text-secondary-text hover:text-black cursor-pointer transition"
        >
          <ReceiptLong className="w-5 h-5 text-secondary-text" />
          <span>View Transactions</span>
        </button>

        <button
          onClick={() => { }}
          className="flex-1 bg-white hover:bg-gray-50 border border-divider shadow-xs py-3.5 rounded-xl flex items-center justify-center gap-x-2 text-sm font-semibold text-secondary-text hover:text-black cursor-pointer transition"
        >
          <FileDownload className="w-5 h-5 text-secondary-text" />
          <span>Download Invoice</span>
        </button>
      </div>
    </div>
  );
};

export default UserDetail;
