"use client";

import { motion } from "framer-motion";
import { Star, Play, Github, Coffee, Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingPage() {
  const handleStartWebApp = () => {
    window.location.href = "/";
  };

  const handleDownloadMac = () => {
    window.open(
      "https://apps.apple.com/us/app/prio-space/id6752712865",
      "_blank"
    );
  };

  const handleStarGitHub = () => {
    window.open("https://github.com/anoyrc/priospace", "_blank");
  };

  const handleDownloadWindows = () => {
    window.open(
      "https://github.com/AnoyRC/priospace/releases/download/0.1.3/priospace_0.1.3_x64-setup.exe",
      "_blank"
    );
  };

  const handleDownloadiOS = () => {
    window.open(
      "https://apps.apple.com/us/app/prio-space/id6752712865?platform=iphone",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <motion.main
        className="pt-14 flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <section className="container min-h-screen space-y-6 -mt-14 flex items-center justify-center py-10 px-2">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center gap-4 text-center">
            <motion.h1
              variants={fadeInUp}
              className="font-heading text-3xl font-extrabold"
            >
              Prio Space
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="max-w-[50rem] text-muted-foreground text-4xl sm:text-6xl leading-20 font-extrabold"
            >
              A beautiful, modern productivity app that combines powerful task
              management with a Pomodoro timer, habit tracking, and task
              collaboration.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="flex gap-4 flex-row mt-3"
            >
              <Button
                size="lg"
                onClick={handleStartWebApp}
                className="gap-2 p-6 w-36 py-7 rounded-full text-xl font-extrabold"
                asChild
              >
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-4 w-4" />
                  Web
                </motion.button>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadMac}
                className="gap-2 p-6 w-36 py-7 rounded-full text-xl font-extrabold"
                asChild
              >
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                   Mac
                </motion.button>
              </Button>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="flex gap-4 flex-row"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadiOS}
                className="gap-2 p-6 w-36 py-7 rounded-full text-xl font-extrabold"
                asChild
              >
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                   ios
                </motion.button>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadWindows}
                className="gap-1 p-6 w-36 py-7 rounded-full text-lg font-extrabold"
                asChild
              >
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid2X2 className="h-4 w-4" />
                  Windows
                </motion.button>
              </Button>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="flex gap-4 flex-row"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleStarGitHub}
                className="gap-2 p-6 w-48 py-7 rounded-full text-xl font-extrabold"
                asChild
              >
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="h-4 w-4" /> Github
                </motion.button>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* GitHub Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <motion.div
            variants={fadeInUp}
            className="mx-auto max-w-[58rem] text-center"
          >
            <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-3xl">
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:p-12 text-slate-50">
                <div className="flex items-center gap-2">
                  <Github className="h-6 w-6 opacity-80" />
                  <h2 className="text-lg font-extrabold">Open Source & Free</h2>
                </div>
                <div className="space-y-4">
                  <p className="max-w-[46rem] opacity-90 text-4xl font-extrabold leading-[2.7rem]">
                    Prio Space is completely open source. Star the repository,
                    contribute to the project, or fork it to make it your own.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleStarGitHub}
                  className="gap-2 p-6 py-7 mt-2 rounded-full [&_svg]:size-6 text-xl font-extrabold bg-white text-slate-900 hover:bg-white/90"
                  asChild
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Star className="h-6 w-6 animate-pulse" />
                    Star on GitHub
                  </motion.button>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="py-6 md:py-0 flex justify-center items-center font-extrabold"
      >
        <div className="container flex flex-col items-center justify-center gap-4 py-10 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:px-0">
            <p className="text-center text-3xl sm:leading-loose text-muted-foreground md:text-left leading-snug">
              Coded with ❤️ by{" "}
              <a
                href="https://x.com/Anoyroyc"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold underline underline-offset-4"
              >
                Anoy
              </a>
            </p>

            <Button
              size="lg"
              onClick={() => window.open("https://coff.ee/anoy", "_blank")}
              className="gap-2 p-6 py-7 sm:-mt-2 rounded-full text-xl [&_svg]:size-6 font-extrabold"
              asChild
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Coffee className="h-6 w-6 animate-pulse" />
                Buy me a coffee
              </motion.button>
            </Button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
