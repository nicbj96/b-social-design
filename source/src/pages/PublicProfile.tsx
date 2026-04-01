import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Heart, Users, Send, UserPlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  user_id: string;
  display_name: string | null;
  home_city: string | null;
  interests: string[];
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export default function PublicProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState<number>(0);
  const [friendStatus, setFriendStatus] = useState<"not_friends" | "friends" | "pending_sent" | "pending_received">("not_friends");
  const [actionLoading, setActionLoading] = useState(false);

  // Hash-based routing: extract ID from window.location.hash (#/profil/UUID)
  const hashParts = typeof window !== "undefined" ? window.location.hash.replace("#", "").split("/") : [];
  const profileId = hashParts[hashParts.length - 1];

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("user_id, display_name, home_city, interests")
          .eq("user_id", profileId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch friend count
        const { count, error: countError } = await supabase
          .from("my_friends")
          .select("friend_id", { count: "exact", head: true })
          .eq("user_id", profileId);

        if (!countError) {
          setFriendCount(count ?? 0);
        }

        // Check friendship status
        if (user?.id) {
          await checkFriendStatus(user.id, profileId);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, user?.id]);

  const checkFriendStatus = async (currentUserId: string, targetUserId: string) => {
    try {
      // Check if already friends
      const { data: friendData } = await supabase
        .from("my_friends")
        .select("friend_id")
        .eq("user_id", currentUserId)
        .eq("friend_id", targetUserId)
        .single();

      if (friendData) {
        setFriendStatus("friends");
        return;
      }

      // Check if pending request sent by current user
      const { data: sentRequest } = await supabase
        .from("friend_requests")
        .select("id")
        .eq("sender_id", currentUserId)
        .eq("receiver_id", targetUserId)
        .eq("status", "pending")
        .single();

      if (sentRequest) {
        setFriendStatus("pending_sent");
        return;
      }

      // Check if pending request received by current user
      const { data: receivedRequest } = await supabase
        .from("friend_requests")
        .select("id")
        .eq("sender_id", targetUserId)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending")
        .single();

      if (receivedRequest) {
        setFriendStatus("pending_received");
        return;
      }

      setFriendStatus("not_friends");
    } catch (err) {
      console.error("Error checking friend status:", err);
      setFriendStatus("not_friends");
    }
  };

  const handleAddFriend = async () => {
    if (!user?.id || !profileId) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from("friend_requests").insert({
        sender_id: user.id,
        receiver_id: profileId,
        status: "pending",
      });
      if (error) throw error;
      setFriendStatus("pending_sent");
    } catch (err) {
      console.error("Error adding friend:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!user?.id || !profileId) return;
    setActionLoading(true);
    try {
      // Update friend request status
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("sender_id", profileId)
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (updateError) throw updateError;
      // my_friends is a VIEW derived from friend_requests — no insert needed
      setFriendStatus("friends");
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!user?.id || !profileId) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("sender_id", profileId)
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (error) throw error;
      setFriendStatus("not_friends");
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id || !profileId) return;
    try {
      // Create or find conversation
      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participants->>0.eq.${user.id},participants->>1.eq.${profileId}),and(participants->>0.eq.${profileId},participants->>1.eq.${user.id})`
        )
        .single();

      let convoId = existingConvo?.id;
      if (!convoId) {
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert({
            participants: [user.id, profileId],
          })
          .select("id")
          .single();
        convoId = newConvo?.id;
      }

      if (convoId) {
        navigate(`/beskeder?convo=${convoId}`);
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  const displayInitial = profile?.display_name
    ? profile.display_name[0]?.toUpperCase()
    : "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
        <div className="text-white/50">Indlæser...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center">
        <p className="text-white/50 mb-4">Profil ikke fundet</p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 bg-[#4ECDC4]/15 text-[#4ECDC4] rounded-xl hover:bg-[#4ECDC4]/25"
        >
          <ArrowLeft size={16} />
          Tilbage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white pb-20">
      {/* Header with back button */}
      <div className="bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] p-6 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/20 rounded-xl hover:bg-white/30 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          {false /* no avatar_url column */ ? (
            <img
              src={false /* no avatar_url column */}
              alt={profile.display_name || "Bruger"}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/30"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#4ECDC4] text-3xl font-bold">
              {displayInitial}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name || "Bruger"}</h1>
            {profile.home_city && (
              <p className="text-white/80 flex items-center gap-1 text-sm">
                <MapPin size={14} /> {profile.home_city}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="glass-card rounded-2xl p-4 text-center">
            <Users size={20} className="mx-auto mb-2 text-[#4ECDC4]" />
            <p className="text-2xl font-bold">{friendCount}</p>
            <p className="text-xs text-white/50">Venner</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <Heart size={20} className="mx-auto mb-2 text-[#4ECDC4]" />
            <p className="text-2xl font-bold">{profile.interests?.length || 0}</p>
            <p className="text-xs text-white/50">Interesser</p>
          </div>
        </div>

        {/* Bio */}
        {false /* no bio column */ && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <p className="text-sm text-white/70">{false /* no bio column */}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
              <Heart size={16} className="text-[#4ECDC4]" />
              Interesser
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map(interest => (
                <span
                  key={interest}
                  className="px-3 py-1.5 bg-[#4ECDC4]/15 text-[#4ECDC4] rounded-full text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {friendStatus === "not_friends" && (
            <button
              onClick={handleAddFriend}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4ECDC4] text-[#0a0f1a] rounded-xl font-semibold hover:bg-[#4ECDC4]/90 transition-colors disabled:opacity-50"
            >
              <UserPlus size={18} />
              {actionLoading ? "Tilføjer..." : "Tilføj ven"}
            </button>
          )}

          {friendStatus === "friends" && (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4ECDC4]/15 text-[#4ECDC4] rounded-xl font-semibold">
              <Users size={18} />
              I er venner ✓
            </div>
          )}

          {friendStatus === "pending_sent" && (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white/70 rounded-xl font-semibold">
              <Users size={18} />
              Anmodning sendt
            </div>
          )}

          {friendStatus === "pending_received" && (
            <div className="space-y-2">
              <button
                onClick={handleAcceptRequest}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4ECDC4] text-[#0a0f1a] rounded-xl font-semibold hover:bg-[#4ECDC4]/90 transition-colors disabled:opacity-50"
              >
                <UserPlus size={18} />
                {actionLoading ? "Accepterer..." : "Acceptér"}
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white/70 rounded-xl font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <X size={18} />
                Afvis
              </button>
            </div>
          )}

          <button
            onClick={handleSendMessage}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            <Send size={18} />
            Send besked
          </button>
        </div>
      </div>
    </div>
  );
}
