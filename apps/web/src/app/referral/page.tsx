'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Users, Copy, CheckCircle, Share2 } from 'lucide-react'

const steps = [
  {
    icon: Share2,
    title: 'Share Your Link',
    description: 'Get your unique referral link from your account settings.',
  },
  {
    icon: Users,
    title: 'Friends Sign Up',
    description: 'When a friend joins CrossMart using your link, they get a welcome bonus.',
  },
  {
    icon: Gift,
    title: 'Earn Rewards',
    description: 'You both earn rewards when your friend makes their first purchase.',
  },
]

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'CM-REF-XXXXX'

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Refer & Earn</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share CrossMart with friends and earn rewards for every successful referral.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                </div>
                <step.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Code */}
        <Card className="max-w-md mx-auto mb-12">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-4">Your Referral Code</h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <code className="text-2xl font-mono font-bold bg-muted px-4 py-2 rounded-lg">
                {referralCode}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Share this code with friends to earn rewards.
            </p>
            <Button className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral Link
            </Button>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Referral Rewards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">For You</p>
                <p className="text-sm text-muted-foreground">Earn 5,000 MMK credit for each referral</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">For Your Friend</p>
                <p className="text-sm text-muted-foreground">Get 3,000 MMK welcome bonus on first order</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
