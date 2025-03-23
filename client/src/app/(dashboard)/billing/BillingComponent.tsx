"use client"

import { useState } from "react"
import { CreditCard, Receipt, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export default function BillingComponent() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscription">
            <Package className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="history">
            <Receipt className="h-4 w-4 mr-2" />
            Billing History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the Pro plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="billing-toggle">Bill Yearly</Label>
                  <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
                  <Badge variant="secondary">Save 20%</Badge>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">${isYearly ? "192" : "20"}</p>
                  <p className="text-sm text-muted-foreground">per {isYearly ? "year" : "month"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle>Pro</CardTitle>
                    <CardDescription>
                      <Badge>Current Plan</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${isYearly ? "192" : "20"}</p>
                    <p className="text-sm text-muted-foreground">per {isYearly ? "year" : "month"}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>✓ Advanced analytics</li>
                      <li>✓ 24/7 support</li>
                      <li>✓ Custom integrations</li>
                      <li>✓ 10 team members</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team</CardTitle>
                    <CardDescription>For growing teams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${isYearly ? "480" : "50"}</p>
                    <p className="text-sm text-muted-foreground">per {isYearly ? "year" : "month"}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>✓ Everything in Pro</li>
                      <li>✓ Unlimited team members</li>
                      <li>✓ Advanced security</li>
                      <li>✓ Custom reporting</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Upgrade
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>For large organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">Custom</p>
                    <p className="text-sm text-muted-foreground">Contact sales</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>✓ Everything in Team</li>
                      <li>✓ Dedicated support</li>
                      <li>✓ Custom SLAs</li>
                      <li>✓ Enterprise integrations</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Contact Sales
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Cancel Subscription</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted p-2 rounded-md">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2024</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Add New Payment Method</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="card-name">Name on Card</Label>
                    <Input id="card-name" placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Payment Method</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Mar 1, 2023</TableCell>
                      <TableCell>Pro Plan (Monthly)</TableCell>
                      <TableCell>$20.00</TableCell>
                      <TableCell>
                        <Badge variant="success">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Feb 1, 2023</TableCell>
                      <TableCell>Pro Plan (Monthly)</TableCell>
                      <TableCell>$20.00</TableCell>
                      <TableCell>
                        <Badge variant="success">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jan 1, 2023</TableCell>
                      <TableCell>Pro Plan (Monthly)</TableCell>
                      <TableCell>$20.00</TableCell>
                      <TableCell>
                        <Badge variant="success">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

