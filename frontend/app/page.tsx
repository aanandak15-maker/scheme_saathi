
"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, ShieldCheck, Sparkles, Languages,
  Mic, UserCheck, FileText, Phone, PlayCircle,
  Building2, Users, IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-bg-warm">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-saffron/10 blur-[100px] animate-float opacity-70"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-teal/10 blur-[100px] animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container relative z-10 px-4 mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-saffron/20 shadow-sm mb-4">
              <Sparkles className="h-4 w-4 text-brand-saffron fill-brand-saffron" />
              <span className="text-sm font-semibold text-foreground/80 tracking-wide">AI-POWERED GOV SCHEME FINDER</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-saffron to-brand-teal">Rights</span>,<br />
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-saffron">Future</span>.
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Scheme Saathi uses advanced AI to match you with the right government schemes.
              Speak naturally in your language.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/check-eligibility">
                <Button size="lg" className="text-lg px-8 h-14 rounded-full bg-brand-saffron hover:bg-brand-saffron/90 text-white shadow-xl shadow-brand-saffron/20 hover:shadow-brand-saffron/40 transition-all hover:scale-105">
                  Check Eligibility <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/schemes">
                <Button variant="outline" size="lg" className="text-lg px-8 h-14 rounded-full border-2 hover:bg-muted/50 transition-all">
                  <PlayCircle className="mr-2 h-5 w-5" /> Browse Schemes
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-8 flex justify-center gap-8 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-teal" /> Verified Data</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-teal" /> 50k+ Citizens Impacted</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="20+" label="Schemes Database" icon={<FileText className="h-5 w-5 text-brand-teal" />} />
            <StatCard number="Pan India" label="Coverage" icon={<Building2 className="h-5 w-5 text-brand-saffron" />} />
            <StatCard number="3" label="Languages" icon={<Languages className="h-5 w-5 text-brand-emerald" />} />
            <StatCard number="₹10L+" label="Potential Benefits" icon={<IndianRupee className="h-5 w-5 text-brand-teal" />} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-bg-warm relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Choose Scheme Saathi?</h2>
            <p className="text-muted-foreground text-lg">We simplify the complex world of government benefits using cutting-edge technology.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="h-8 w-8 text-white" />}
              iconBg="bg-gradient-to-br from-brand-saffron to-brand-saffron/70"
              title="Voice First Interface"
              description="Don't type. Just speak in Hindi, Bhojpuri, or English. Our AI understands local dialects and context perfectly."
            />
            <FeatureCard
              icon={<UserCheck className="h-8 w-8 text-white" />}
              iconBg="bg-gradient-to-br from-brand-teal to-brand-teal/70"
              title="Instant Eligibility"
              description="Stop guessing. Our eligibility engine checks 50+ parameters instantly to tell you exactly what you qualify for."
            />
            <FeatureCard
              icon={<Languages className="h-8 w-8 text-white" />}
              iconBg="bg-gradient-to-br from-brand-emerald to-brand-emerald/70"
              title="Multilingual Support"
              description="Information is power, but only if you understand it. Get simplified explanations in your mother tongue."
            />
          </div>
        </div>
      </section>

      {/* Trust Banner / CTA */}
      <section className="py-20 bg-brand-teal text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Bharat, by Bharat. 🇮🇳</h2>
            <p className="text-white/80 text-lg opacity-90 mb-8">
              Join thousands of Village Level Entrepreneurs (VLEs) and citizens who trust Scheme Saathi for accurate scheme information.
            </p>
            <div className="flex flex-wrap gap-4">
              {/* <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 flex items-center gap-3">
                <Phone className="h-6 w-6" />
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wider">Missed Call Service</p>
                  <p className="text-xl font-bold">Coming Soon</p>
                </div>
              </div> */}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-brand-saffron blur-[60px] opacity-30 rounded-full"></div>
            <Link href="/check-eligibility">
              <Button size="lg" className="h-16 px-10 text-lg bg-white text-brand-teal hover:bg-gray-50 rounded-full font-bold shadow-2xl relative z-10">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ number, label, icon }: { number: string, label: string, icon: React.ReactNode }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-center mb-4 p-3 bg-white rounded-full w-fit mx-auto shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{number}</h3>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, iconBg, title, description }: { icon: React.ReactNode, iconBg: string, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-border/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
      <div className={`h-14 w-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-brand-teal transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
