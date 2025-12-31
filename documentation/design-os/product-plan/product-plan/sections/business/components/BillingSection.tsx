import { useState } from 'react'
import { CreditCard, AlertTriangle, Download, ArrowUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PaymentPlan, Subscription, Invoice } from '../types'

interface BillingSectionProps {
  subscription: Subscription
  paymentPlans: PaymentPlan[]
  invoices: Invoice[]
  onUpgradePlan?: (planId: string) => void
  onCancelSubscription?: () => void
  onDownloadInvoice?: (invoiceId: string) => void
  isLoading?: boolean
}

export function BillingSection({
  subscription,
  paymentPlans,
  invoices,
  onUpgradePlan,
  onCancelSubscription,
  onDownloadInvoice,
  isLoading,
}: BillingSectionProps) {
  const currentPlan = paymentPlans.find((p) => p.id === subscription.planId)
  const otherPlans = paymentPlans.filter((p) => p.id !== subscription.planId)
  const isAtLimit = currentPlan && currentPlan.limits.employees > 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Billing & Plan
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your subscription plan and billing information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan && (
            <>
              <div>
                <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {currentPlan.name}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {currentPlan.description}
                </div>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-4">
                  {formatCurrency(currentPlan.price)}
                  <span className="text-lg font-normal text-slate-600 dark:text-slate-400">
                    /{currentPlan.billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Features:</div>
                <ul className="space-y-1.5">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {isAtLimit && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
                        Plan Limit Reached
                      </div>
                      <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        You've reached the employee limit for your current plan. Upgrade to add more team members.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>Renewal date: {formatDate(subscription.currentPeriodEnd)}</div>
              </div>
            </>
          )}

          {otherPlans.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                onClick={() => onUpgradePlan?.(otherPlans[0].id)}
                disabled={isLoading}
                className="w-full"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Upgrade to {otherPlans[0].name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No invoices yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{invoice.period}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'default'
                            : invoice.status === 'pending'
                              ? 'outline'
                              : 'destructive'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadInvoice?.(invoice.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

