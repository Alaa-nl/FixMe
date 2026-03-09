"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({ src, name, size = "md", className = "" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getColorFromName = (name?: string | null) => {
    if (!name) return "bg-gray-400";
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarSrc = imageError ? "/default-avatar.svg" : (src || "/default-avatar.svg");

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage
        src={avatarSrc}
        alt={name || "User"}
        onError={() => setImageError(true)}
      />
      <AvatarFallback
        className={`${getColorFromName(name)} text-white font-semibold`}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}