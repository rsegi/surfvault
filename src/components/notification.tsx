"use client";

// import { useState } from "react";
// import { Toaster, toast } from "sonner";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

type NotificationType = "success" | "error" | "warning";

interface NotificationProps {
  type: NotificationType;
  title: string;
  description?: string;
}

const notificationTypeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; className: string }
> = {
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    className: "border-l-4 border-green-500",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    className: "border-l-4 border-red-500",
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    className: "border-l-4 border-yellow-500",
  },
};

export default function CustomNotification({
  type,
  title,
  description,
}: NotificationProps) {
  const { icon, className } = notificationTypeConfig[type];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
}

// function SonnerDemo() {
//   const [count, setCount] = useState(0);

//   const showNotification = (type: NotificationType) => {
//     setCount((prev) => prev + 1);
//     toast.custom((t) => (
//       <CustomNotification
//         type={type}
//         title={`This is a ${type} message`}
//         description={`Notification ${count + 1}: Additional details about the ${type}`}
//       />
//     ));
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen gap-4">
//       <Button
//         onClick={() => showNotification("success")}
//         className="bg-green-500 hover:bg-green-600"
//       >
//         Show Success Notification
//       </Button>
//       <Button
//         onClick={() => showNotification("error")}
//         className="bg-red-500 hover:bg-red-600"
//       >
//         Show Error Notification
//       </Button>
//       <Button
//         onClick={() => showNotification("warning")}
//         className="bg-yellow-500 hover:bg-yellow-600"
//       >
//         Show Warning Notification
//       </Button>
//       <Toaster expand={true} position="top-center" />
//     </div>
//   );
// }
