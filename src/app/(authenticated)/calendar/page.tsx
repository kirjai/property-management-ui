import { calendarRoute, homeRoute } from "@/app-routes";
import { redirect } from "next/navigation";

export default function CalendarPage() {
  return redirect(calendarRoute(new Date(), homeRoute));
}
