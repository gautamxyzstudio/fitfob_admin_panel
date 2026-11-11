import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const notifications = [
  {
    title: "New Club Request",
    desc: "Anytime Fitness has sent a request to join Fitfob.",
    time: "1 Min",
    active: true,
  },
  {
    title: "Club Approved",
    desc: "Planet Fitness club request has been approved successfully.",
    time: "6 Min",
    active: true,
  },
  {
    title: "Members & Memberships",
    desc: "New Member Joined A new member has joined Gold’s Gym.",
    time: "15 Min",
    active: true,
  },
  {
    title: "Membership Upgraded",
    desc: "A member upgraded from Standard to Premium plan.",
    time: "18 Min",
    active: true,
  },
  {
    title: "Earnings & Payouts",
    desc: "LA Fitness has requested a payout.",
    time: "22 Min",
  },
  {
    title: "Payout Completed",
    desc: "₹45,000 payout successfully transferred to Anytime Fitness.",
    time: "26 Min",
  },
  {
    title: "System / App",
    desc: "New Facility Added “Yoga Studio” facility added successfully.",
    time: "30 Min",
  },
  {
    title: "New Login Detected",
    desc: "New login detected from a different device.",
    time: "42 Min",
  },
];

const DrawerNotification = ({ open, onClose }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          borderTopLeftRadius: "20px",
          borderBottomLeftRadius: "20px",
          width: 400,
        },
      }}
    >
      <div className="rounded-2xl p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-black leading-7">
              Notification
            </h3>
            <div className="bg-[#f6f6f6] px-1.75 rounded-3xl">
              <span className="text-sm text-black opacity-30">04</span>
            </div>
          </div>

          <button onClick={onClose}>
            <CloseIcon
              className="text-black50 cursor-pointer font-bold"
              fontSize="medium"
            />
          </button>
        </div>
        <hr className="border-t border-[#11111133]" />

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-1 mt-2.5">
          {notifications.map((item, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={` cursor-pointer transition
                ${index === activeIndex || item.active ? "bg-bg rounded-xl px-2.5 py-4" : "bg-white py-2.5"}
              `}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-xs text-black50">{item.time}</span>
              </div>
              <p className="text-xs text-black50 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerNotification;
