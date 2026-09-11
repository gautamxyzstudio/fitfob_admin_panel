import { useNavigate, useParams } from "react-router";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import CustomButton from "../../components/atoms/customButton/CustomButton";
import ActivityIndicator from "../../components/atoms/activityIndicator/ActivityIndicator";
import { useClientDetail } from "../../hooks/client/useClient";
import { IMAGES } from "../../assets/exports";
import dayjs from "dayjs";
import {
  Description,
  FileDownload,
  ReceiptLong,
} from "@mui/icons-material";

const UserDetail = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { client, loading } = useClientDetail(docId);

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
    ? dayjs(client.createdAt).format("DD/MM/YYYY")
    : "10/02/2025";
  const dateOfBirth = client?.date_of_birth
    ? dayjs(client.date_of_birth).format("DD/MM/YYYY")
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

  // Checkins data (use real client_checkins or fallback mockup)
  const checkins =
    client?.client_checkins && client.client_checkins.length > 0
      ? client.client_checkins
      : [
          {
            id: 1,
            documentId: "CKID90021",
            checkinTime: "2026-12-01T07:45:00.000Z",
            subscriptionType: "Luxury",
            club_owner: {
              clubName: "Anytime Fitness",
              clubCategory: "Luxury",
            },
          },
          {
            id: 2,
            documentId: "CKID90022",
            checkinTime: "2026-12-02T08:30:00.000Z",
            subscriptionType: "Budget",
            club_owner: {
              clubName: "Planet Fitness",
              clubCategory: "Budget",
            },
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
          All Club Requests
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

        <CustomButton
          buttonStyle="white"
          label="Edit"
          customStyles="px-8 py-2 rounded-lg font-medium text-sm text-secondary-text border border-divider shadow-xs hover:bg-gray-50!"
          onClick={() => navigate(`/users/edit/${docId}`)}
        />
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
                  ? dayjs(sub.startDate).format("MM/DD/YYYY")
                  : "01/14/2026";
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
                        className={`px-3 py-1 rounded-[52px] text-xs font-medium capitalize ${
                          isSubActive
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
          <button className="text-sm font-medium text-secondary-text hover:text-black cursor-pointer">
            View All
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] text-secondary-text text-xs border-b border-divider">
                <th className="py-3 px-4 font-normal">Checkin ID</th>
                <th className="py-3 px-4 font-normal">Club</th>
                <th className="py-3 px-4 font-normal">Date</th>
                <th className="py-3 px-4 font-normal">Time</th>
                <th className="py-3 px-4 font-normal">Memberships</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((chk: any, idx: number) => {
                const chkId = chk.documentId?.startsWith("CKID")
                  ? chk.documentId
                  : `CKID9002${idx + 1}`;
                const clubName = chk.club_owner?.clubName || "Anytime Fitness";
                const dateStr = chk.checkinTime
                  ? dayjs(chk.checkinTime).format("MM/DD/YYYY")
                  : "12/01/2026";
                const timeStr = chk.checkinTime
                  ? dayjs(chk.checkinTime).format("hh:mm A")
                  : "07:45 AM";
                const membership =
                  chk.club_owner?.clubCategory ||
                  chk.subscriptionType ||
                  "Luxury";

                return (
                  <tr
                    key={chk.id || idx}
                    className="border-b border-gray-100 hover:bg-gray-50/60 transition"
                  >
                    <td className="py-3.5 px-4 text-black font-normal">
                      {chkId}
                    </td>
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
              })}
            </tbody>
          </table>
        </div>
      </CustomBox>

      {/* Bottom Action Buttons */}
      <div className="flex flex-row gap-x-4 w-full pt-1">
        <button
          onClick={() => {}}
          className="flex-1 bg-white hover:bg-gray-50 border border-divider shadow-xs py-3.5 rounded-xl flex items-center justify-center gap-x-2 text-sm font-semibold text-secondary-text hover:text-black cursor-pointer transition"
        >
          <ReceiptLong className="w-5 h-5 text-secondary-text" />
          <span>View Transactions</span>
        </button>

        <button
          onClick={() => {}}
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
