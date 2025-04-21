"use client"

import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Download } from "lucide-react"

interface TimetableSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomNumber: string
  course: {
    id: string
    code: string
    title: string
  }
  lecturerCourse?: {
    lecturer: {
      profile: {
        firstName: string
        lastName: string
      }
    }
  }
}

interface PrintTimetableProps {
  timetable: {
    name: string
    semester: {
      name: string
      startDate: string | Date
      endDate: string | Date
    }
    slots: TimetableSlot[]
  }
  studentName?: string
}

export function PrintTimetable({ timetable, studentName }: PrintTimetableProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeSlots = [
    "8:00 AM - 9:30 AM",
    "9:45 AM - 11:15 AM",
    "11:30 AM - 1:00 PM",
    "2:00 PM - 3:30 PM",
    "3:45 PM - 5:15 PM",
  ]

  // Organize timetable data by day and time
  const timetableData: Record<string, Record<string, TimetableSlot>> = {}

  weekdays.forEach((day) => {
    timetableData[day] = {}
  })

  timetable.slots.forEach((slot) => {
    const day = weekdays[slot.dayOfWeek - 1] // Convert 1-based to 0-based index
    const timeKey = `${slot.startTime} - ${slot.endTime}`

    if (!timetableData[day]) {
      timetableData[day] = {}
    }

    timetableData[day][timeKey] = slot
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Timetable_${timetable.semester.name.replace(/\s+/g, "_")}`,
    onBeforeGetContent: () => {
      setIsPrinting(true)
      return Promise.resolve()
    },
    onAfterPrint: () => {
      setIsPrinting(false)
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handlePrint} disabled={isPrinting} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Timetable
        </Button>
        <Button variant="outline" onClick={handlePrint} disabled={isPrinting} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div ref={printRef} className="print-container">
            <div className="print-header text-center mb-6">
              <h1 className="text-2xl font-bold">BUGEMA UNIVERSITY</h1>
              <p className="text-lg">Class Timetable</p>
              <p className="text-md">{timetable.semester.name}</p>
              {studentName && <p className="text-md mt-2">Student: {studentName}</p>}
              <p className="text-sm mt-2">
                {new Date(timetable.semester.startDate).toLocaleDateString()} -{" "}
                {new Date(timetable.semester.endDate).toLocaleDateString()}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100">Time</th>
                    {weekdays.slice(0, 5).map((day) => (
                      <th key={day} className="border border-gray-300 p-2 bg-gray-100">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="border border-gray-300 p-2 font-medium text-sm">{timeSlot}</td>
                      {weekdays.slice(0, 5).map((day) => {
                        // Find a slot that matches this day and has a time range that includes this timeSlot
                        const matchingSlots = Object.entries(timetableData[day] || {}).filter(([slotTime]) => {
                          return (
                            slotTime === timeSlot || (timetableData[day][timeSlot] && timetableData[day][timeSlot].id)
                          )
                        })

                        const slot = matchingSlots.length > 0 ? timetableData[day][matchingSlots[0][0]] : null

                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-300 p-2">
                            {slot ? (
                              <div className="p-1">
                                <div className="font-semibold text-sm">{slot.course.code}</div>
                                <div className="text-xs">{slot.course.title}</div>
                                <div className="text-xs mt-1">Room: {slot.roomNumber}</div>
                                {slot.lecturerCourse && (
                                  <div className="text-xs">
                                    Lecturer: {slot.lecturerCourse.lecturer.profile.firstName}{" "}
                                    {slot.lecturerCourse.lecturer.profile.lastName}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center text-sm">
              <p>This timetable is subject to change. Please check regularly for updates.</p>
              <p className="mt-2">© {new Date().getFullYear()} Bugema University. All rights reserved.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          @page {
            size: landscape;
            margin: 0.5cm;
          }
        }
      `}</style>
    </div>
  )
}
