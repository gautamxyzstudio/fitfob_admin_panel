import { ICONS } from "../assets/exports";

export const routes = [
  {
    name: "Dashboard",
    key: "dashboard",
    icon: ICONS.Dashboard,
    iconFill: ICONS.DashboardFill,
    route: "/",
  },
  {
    name: "Club Request",
    key: "clubRequest",
    icon: ICONS.ClubReq,
    iconFill: ICONS.ClubReqFill,
    route: "/club-request",
  },
  {
    name: "Clubs",
    key: "clubs",
    icon: ICONS.Clubs,
    iconFill: ICONS.ClubsFill,
    route: "/clubs",
  },
  {
    name: "User’s",
    key: "users",
    icon: ICONS.User,
    iconFill: ICONS.UserFill,
    route: "/users",
  },
  {
    name: "Earnings",
    key: "earnings",
    icon: ICONS.Earn,
    iconFill: ICONS.EarnFill,
    route: "/earnings",
  },
  {
    name: "Check In",
    key: "checkIn",
    icon: ICONS.CheckIn,
    iconFill: ICONS.CheckInFill,
    route: "/check-in",
  },
  {
    name: "Payouts",
    key: "payouts",
    icon: ICONS.Payouts,
    iconFill: ICONS.PayoutsFill,
    route: "/payouts",
  },
  {
    name: "App Settings",
    key: "appSettings",
    icon: ICONS.App,
    iconFill: ICONS.AppFill,
    route: "/app",
    subRoute: [
      {
        name: "Facilities",
        key: "facilities",
        route: "/app/facilities",
      },
      {
        name: "Club Types",
        key: "clubTypes",
        route: "/app/club-types",
      },
    ],
  },
];
