"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  index: number;
  onClick: () => void;
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  gradient,
  index,
  onClick,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`relative overflow-hidden cursor-pointer group border-2 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl ${gradient}`}
        onClick={onClick}
        data-testid={`feature-card-${title.toLowerCase().replace(/s+/g, "-")}`}
      >
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="relative p-6 flex flex-col items-center text-center space-y-4 h-full">
          {/* Icon with Animation */}
          <motion.div
            className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-8 w-8 text-blue-600" />
          </motion.div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed flex-grow">
            {description}
          </p>

          {/* Call to Action */}
          <Button
            variant="ghost"
            className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all"
            onClick={onClick}
          >
            Get Started →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
