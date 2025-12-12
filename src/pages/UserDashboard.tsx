import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Heart, History, Settings, Loader2, MapPin, Calendar, Clock, Phone, Mail, CalendarDays, Zap } from "lucide-react";
import { getFavorites, getQuoteHistory, removeFavorite, User as UserType } from "@/lib/auth";
import { getUserBookings, cancelBooking, formatBookingDate, formatTimeSlot, getUrgencyColor, getStatusColor } from "@/lib/bookings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChatSystem } from "@/components/ChatSystem";

export default function UserDashboard() {
    const { user, isAuthenticated, isLoading, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const defaultTab = searchParams.get("tab") || "profile";

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login?redirect=/user/dashboard" replace />;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background py-12">
                <div className="container max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Sidebar / User Info */}
                        <Card className="w-full md:w-80 shrink-0">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 w-24 h-24 relative">
                                    <Avatar className="w-24 h-24 border-2 border-gold/20">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="text-2xl bg-gold/10 text-gold">
                                            {user.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                                {/* Upgrade Button for businesses */}
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-gold text-gold hover:bg-gold hover:text-white"
                                        onClick={() => window.location.href = '/pricing'}
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        Upgrade Business
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        <span>{user.phone || "No phone added"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>{user.postcode || "No postcode added"}</span>
                                    </div>
                                    <div className="pt-4 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Member Since</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gold" />
                                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content */}
                        <div className="flex-1 w-full">
                            <Tabs defaultValue={defaultTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-6 mb-8">
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                                    <TabsTrigger value="messages">Messages</TabsTrigger>
                                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                                    <TabsTrigger value="history">History</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile" className="space-y-6 animate-fade-up">
                                    <ProfileTab user={user} onUpdate={updateUser} />
                                </TabsContent>

                                <TabsContent value="bookings" className="animate-fade-up">
                                    <BookingsTab userId={user.id} />
                                </TabsContent>

                                <TabsContent value="messages" className="animate-fade-up">
                                    <ChatSystem />
                                </TabsContent>

                                <TabsContent value="favorites" className="animate-fade-up">
                                    <FavoritesTab />
                                </TabsContent>

                                <TabsContent value="history" className="animate-fade-up">
                                    <HistoryTab />
                                </TabsContent>

                                <TabsContent value="settings" className="animate-fade-up">
                                    <SettingsTab />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

function ProfileTab({ user, onUpdate }: { user: UserType; onUpdate: (data: Partial<UserType>) => void }) {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || "");
    const [postcode, setPostcode] = useState(user.postcode || "");
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        onUpdate({ name, phone, postcode });
        setIsSaving(false);

        toast({
            title: "Profile updated",
            description: "Your changes have been saved successfully.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your contact details and address</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                value={user.email}
                                disabled
                                className="bg-secondary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+44 7123 456789"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postcode">Default Postcode</Label>
                            <Input
                                id="postcode"
                                value={postcode}
                                onChange={(e) => setPostcode(e.target.value)}
                                placeholder="SW1A 1AA"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving} className="bg-gold hover:bg-gold/90 text-gold-foreground">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function FavoritesTab() {
    const [favorites, setFavorites] = useState(getFavorites());
    const { toast } = useToast();

    const handleRemove = (id: string, name: string) => {
        removeFavorite(id);
        setFavorites(getFavorites());
        toast({
            title: "Removed favorite",
            description: `${name} has been removed from your list.`
        });
    };

    if (favorites.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground bg-card rounded-lg border border-border/50">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                <p>Save businesses to your favorites list for quick access later.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {favorites.map((fav) => (
                <Card key={fav.id} className="overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5">
                                    {fav.tradeName}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {fav.city}
                                </span>
                            </div>
                            <h3 className="text-xl font-display font-medium mb-1">{fav.businessName}</h3>
                            <p className="text-sm text-muted-foreground">Saved on {new Date(fav.savedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => handleRemove(fav.businessId, fav.businessName)}>
                                Remove
                            </Button>
                            <Button asChild className="bg-gold hover:bg-gold/90 text-gold-foreground">
                                <a href={`/${fav.tradeName.toLowerCase().replace(/\s+/g, '-')}/${fav.city.toLowerCase()}`}>
                                    View Business
                                </a>
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function HistoryTab() {
    const history = getQuoteHistory();

    if (history.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground bg-card rounded-lg border border-border/50">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No quote history</h3>
                <p>You haven't requested any quotes yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((item) => (
                <Card key={item.id}>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`
                    ${item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : ''}
                    ${item.status === 'quoted' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : ''}
                    ${item.status === 'accepted' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                    hover:bg-transparent
                  `}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Requested on {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-medium">{item.businessName}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{item.tradeName} • {item.urgency} Urgency</p>
                            </div>
                            <Button variant="outline" size="sm">
                                View Details
                            </Button>
                        </div>
                        <div className="p-4 bg-secondary/20 rounded-lg text-sm">
                            <p className="font-medium mb-1">Your Request:</p>
                            <p className="text-muted-foreground line-clamp-2">"{item.description}"</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function BookingsTab({ userId }: { userId: string }) {
    const [bookings, setBookings] = useState(getUserBookings(userId));
    const { toast } = useToast();

    const handleCancel = (id: string, businessName: string) => {
        cancelBooking(id);
        setBookings(getUserBookings(userId));
        toast({
            title: "Booking cancelled",
            description: `Your appointment with ${businessName} has been cancelled.`,
        });
    };

    if (bookings.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground bg-card rounded-lg border border-border/50">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p>Schedule your first appointment with a tradesperson.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <Card key={booking.id}>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge className={getStatusColor(booking.status)}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </Badge>
                                    <Badge className={getUrgencyColor(booking.urgency)}>
                                        {booking.urgency.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {booking.tradeName}
                                    </span>
                                </div>
                                <h3 className="text-xl font-display font-medium mb-2">{booking.businessName}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatBookingDate(booking.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatTimeSlot(booking.timeSlot)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{booking.postcode}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{booking.customerPhone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {booking.status === "pending" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCancel(booking.id, booking.businessName)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Cancel Booking
                                    </Button>
                                )}
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-secondary/20 rounded-lg">
                            <p className="text-sm font-medium mb-1">Service: {booking.serviceType.replace("-", " ")}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">"{booking.description}"</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function SettingsTab() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChanging, setIsChanging] = useState(false);
    const { toast } = useToast();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (newPassword.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters.",
                variant: "destructive"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please make sure both passwords are the same.",
                variant: "destructive"
            });
            return;
        }

        setIsChanging(true);

        try {
            // Import supabase directly for auth operations
            const { supabase } = await import("@/lib/supabase");

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            toast({
                title: "Password updated",
                description: "Your password has been changed successfully."
            });

            // Clear form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast({
                title: "Error changing password",
                description: error.message || "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gold" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isChanging}
                                className="bg-gold hover:bg-gold/90 text-gold-foreground"
                            >
                                {isChanging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Update Password
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Manage how you receive updates and alerts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Email notification preferences coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
