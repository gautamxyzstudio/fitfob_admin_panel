/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import { useClientDetail } from "../../hooks/client/useClient";
import { IMAGES } from "../../assets/exports";
import { toLocalDate, formatLocalDate, formatLocalTime } from "../../utility/dayjs";
import {
  Description,
  FileDownload,
  ReceiptLong,
} from "@mui/icons-material";
import UserActivityLogs from "../../components/modules/userLogs/UserActivityLogs";

const UserDetail = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { client, loading } = useClientDetail(docId);

  // Checkins data and pagination state
  const [checkinPage, setCheckinPage] = useState<number>(0);
  const checkinRowsPerPage = 10;

  // Sorted checkins (most recent first)
  const sortedCheckins = useMemo(() => {
    const list = client?.client_checkins || [];
    return [...list].sort(
      (a: any, b: any) =>
        toLocalDate(b.checkinTime).valueOf() - toLocalDate(a.checkinTime).valueOf()
    );
  }, [client?.client_checkins]);

  const totalCheckinPages = Math.max(1, Math.ceil(sortedCheckins.length / checkinRowsPerPage));
  const safeCheckinPage = Math.min(
    Math.max(0, checkinPage),
    totalCheckinPages - 1
  );

  const paginatedCheckins = useMemo(() => {
    if (sortedCheckins.length <= 10) {
      return sortedCheckins;
    }
    const startIndex = safeCheckinPage * checkinRowsPerPage;
    return sortedCheckins.slice(startIndex, startIndex + checkinRowsPerPage);
  }, [sortedCheckins, safeCheckinPage]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6 bg-white rounded-xl w-full">
        <ActivityIndicator size={80} />
      </div>
    );
  }

  const avatar = client?.selfieUpload?.url || IMAGES.DummyPROFILE;
  const isBlocked = client?.user?.blocked === true;
  const isActive = !isBlocked;

  // Derive location
  const location =
    client?.location ||
    (client?.local_subscriptions?.[0]?.club_owner?.clubAddress
      ? `${client.local_subscriptions[0].club_owner.clubAddress}`
      : client?.local_subscriptions?.[0]?.club_owner?.city
        ? `${client.local_subscriptions[0].club_owner.city}, ${client.local_subscriptions[0].club_owner.state}`
        : "Sector 3, Faridabad, India");

  // Format dates
  const signUpDate = client?.createdAt
    ? formatLocalDate(client.createdAt, "DD/MM/YYYY")
    : "10/02/2025";
  const dateOfBirth = client?.date_of_birth
    ? formatLocalDate(client.date_of_birth, "DD/MM/YYYY")
    : "18/01/2001";

  // Subscriptions data (use real local_subscriptions or fallback mockup for visual fidelity)
  const subscriptions =
    client?.local_subscriptions && client.local_subscriptions.length > 0
      ? client.local_subscriptions
      : [
        {
          id: 1,
          documentId: "TID1234686",
          startDate: "2026-01-14T00:00:00.000Z",
          subscriptionStatus: "active",
          local_membership_plan: {
            planName: "Luxury",
            price: 4599,
          },
          club_owner: {
            clubName: "Equinox",
            clubCategory: "Luxury",
          },
          paymentMethod: "**** 4861",
        },
        {
          id: 2,
          documentId: "TID1234677",
          startDate: "2025-04-12T00:00:00.000Z",
          subscriptionStatus: "expired",
          local_membership_plan: {
            planName: "Basic",
            price: 1999,
          },
          club_owner: {
            clubName: "Anytime Fitness",
            clubCategory: "Basic",
          },
          paymentMethod: "UPI",
        },
      ];

  return (
    <div className="flex w-full flex-col gap-y-4 pb-6">
      {/* Breadcrumbs matching image 2 */}
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
                className={`px-3 py-0.5 text-xs rounded-[52px] font-medium capitalize ${isActive
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

        <div className="grid grid-cols-4 gap-y-5 gap-x-6">
          {/* Row 1 */}
          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Name
            </span>
            <span className="text-sm font-medium text-black capitalize">
              {client?.name || "David Lee"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Email
            </span>
            <span className="text-sm font-medium text-black">
              {client?.email || "davidlee@gmail.com"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Phone
            </span>
            <span className="text-sm font-medium text-black">
              {client?.phoneNumber || "+9191234-56789"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Account No:
            </span>
            <span className="text-sm font-medium text-black">
              {client?.clientId || "FTB-ACC-000234"}
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Location
            </span>
            <span className="text-sm font-medium text-black">
              {location}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Sign Up Date
            </span>
            <span className="text-sm font-medium text-black">
              {signUpDate}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Status
            </span>
            <span className="text-sm font-medium text-black capitalize">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-secondary-text font-normal">
              Date of Birth
            </span>
            <span className="text-sm font-medium text-black">
              {dateOfBirth}
            </span>
          </div>
        </div>
      </CustomBox>

      {/* Memberships lists Card */}
      <CustomBox customClasses="p-5 flex flex-col gap-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-black">
            Memberships lists
          </h3>
          <button className="text-sm font-medium text-secondary-text hover:text-black cursor-pointer">
            View All
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider">
                <th className="py-3 px-4 font-normal">Transaction ID</th>
                <th className="py-3 px-4 font-normal">Date</th>
                <th className="py-3 px-4 font-normal">Club</th>
                <th className="py-3 px-4 font-normal">Memberships</th>
                <th className="py-3 px-4 font-normal">Amount</th>
                <th className="py-3 px-4 font-normal">Payment Method</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub: any, idx: number) => {
                const isSubActive =
                  sub.subscriptionStatus === "active" ||
                  sub.subscriptionStatus === "Active";
                const transId =
                  sub.documentId?.startsWith("TID")
                    ? sub.documentId
                    : `TID${sub.id || idx + 1}234686`.slice(0, 10);
                const planName =
                  sub.local_membership_plan?.planName ||
                  sub.club_owner?.clubCategory ||
                  "Luxury";
                const price = sub.local_membership_plan?.price
                  ? `₹${sub.local_membership_plan.price.toFixed(2)}`
                  : "₹4599.00";
                const dateStr = sub.startDate
                  ? formatLocalDate(sub.startDate, "DD/MM/YYYY")
                  : "14/01/2026";
                const clubName = sub.club_owner?.clubName || "Equinox";
                const paymentMethod = sub.paymentMethod || "**** 4861";

                return (
                  <tr
                    key={sub.id || idx}
                    className="border-b border-gray-100 hover:bg-gray-50/60 transition"
                  >
                    <td className="py-3.5 px-4 text-black font-normal">
                      {transId}
                    </td>
                    <td className="py-3.5 px-4 text-secondary-text font-normal">
                      {dateStr}
                    </td>
                    <td className="py-3.5 px-4 text-black font-normal">
                      {clubName}
                    </td>
                    <td className="py-3.5 px-4 text-black font-normal">
                      {planName}
                    </td>
                    <td className="py-3.5 px-4 text-black font-normal">
                      {price}
                    </td>
                    <td className="py-3.5 px-4 text-secondary-text font-normal">
                      {paymentMethod}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-1 rounded-[52px] text-xs font-medium capitalize ${isSubActive
                          ? "bg-lightGreen text-green"
                          : "bg-[#FEE2E2] text-[#EF4444]"
                          }`}
                      >
                        {isSubActive ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        title="View Receipt"
                        className="text-secondary-text hover:text-black p-1 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <Description className="w-5 h-5 opacity-60 hover:opacity-100" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CustomBox>

      {/* Checkin list Card */}
      <CustomBox customClasses="p-5 flex flex-col gap-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-black">
            Checkin list
          </h3>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider">
                <th className="py-3 px-4 font-normal">Club Name</th>
                <th className="py-3 px-4 font-normal">Date</th>
                <th className="py-3 px-4 font-normal">Time</th>
                <th className="py-3 px-4 font-normal">Memberships</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCheckins.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-secondary-text text-sm"
                  >
                    No check-ins recorded yet
                  </td>
                </tr>
              ) : (
                paginatedCheckins.map((chk: any, idx: number) => {
                  const clubName = chk.clubName || "Anytime Fitness";
                  const dateStr = chk.checkinTime
                    ? formatLocalDate(chk.checkinTime, "DD/MM/YYYY")
                    : "01/12/2026";
                  const timeStr = chk.checkinTime
                    ? formatLocalTime(chk.checkinTime, "hh:mm A")
                    : "07:45 AM";
                  const membership = chk.subscriptionType || "Luxury";

                  return (
                    <tr
                      key={chk.id || chk.documentId || idx}
                      className="border-b border-gray-100 hover:bg-gray-50/60 transition capitalize"
                    >
                      <td className="py-3.5 px-4 text-black font-normal">
                        {clubName}
                      </td>
                      <td className="py-3.5 px-4 text-secondary-text font-normal">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-secondary-text font-normal">
                        {timeStr}
                      </td>
                      <td className="py-3.5 px-4 text-black font-normal">
                        {membership}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Option - Displayed when length is greater than 10 */}
        {sortedCheckins.length > 10 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-divider">
            <span className="text-secondary-text text-xs sm:text-sm">
              Showing {safeCheckinPage * checkinRowsPerPage + 1} -{" "}
              {Math.min(
                (safeCheckinPage + 1) * checkinRowsPerPage,
                sortedCheckins.length
              )}{" "}
              of {sortedCheckins.length} items
            </span>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <CustomButton
                buttonStyle={safeCheckinPage === 0 ? "disabled" : "outlined"}
                label="Previous"
                disabled={safeCheckinPage === 0}
                customStyles="font-normal! text-xs py-1.5 px-3"
                onClick={() => setCheckinPage((prev) => Math.max(prev - 1, 0))}
              />

              <div className="flex items-center gap-1">
                {Array.from({ length: totalCheckinPages }, (_, i) => {
                  const isCurrent = i === safeCheckinPage;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCheckinPage(i)}
                      className={`min-w-7 h-7 px-1.5 rounded-md text-xs font-medium transition cursor-pointer ${isCurrent
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "bg-white text-secondary-text hover:text-black border border-divider hover:bg-bg"
                        }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <CustomButton
                buttonStyle={
                  safeCheckinPage >= totalCheckinPages - 1
                    ? "disabled"
                    : "outlined"
                }
                label="Next"
                disabled={safeCheckinPage >= totalCheckinPages - 1}
                customStyles={`font-normal! text-xs py-1.5 px-3 ${safeCheckinPage < totalCheckinPages - 1
                    ? "border-primary! text-primary!"
                    : ""
                  }`}
                onClick={() =>
                  setCheckinPage((prev) =>
                    Math.min(prev + 1, totalCheckinPages - 1)
                  )
                }
              />
            </div>
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
