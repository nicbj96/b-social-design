import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Heart, Users, Send, UserPlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ── Scoped CSS ── */
const publicProfileCSS = `${pageBase("pp")}

/* ── Hero ── */
.pp-hero {
  position: relative;
  min-height: 320px;
  background: url('/social-hero.png') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px 24px 72px;
}
.pp-hero::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(
    180deg,
    rgba(6,10,15,0.3) 0%,
    rgba(6,10,15,0.6) 50%,
    rgba(6,10,15,1) 100%
  );
  pointer-events: none;
}
.pp-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

/* ── Back button ── */
.pp-back {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  color: var(--pg-white);
  cursor: pointer;
  transition: all 0.3s;
}
.pp-back:hover {
  background: rgba(78,205,196,0.15);
  border-color: rgba(78,205,196,0.3);
  color: var(--teal);
}

/* ── Avatar ── */
.pp-avatar {
  width: 88px; height: 88px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif);
  font-size: 36px; font-weight: 400;
  color: var(--bg);
  background: linear-gradient(135deg, var(--teal), #44A08D);
  border: 3px solid rgba(255,255,255,0.15);
  box-shadow: 0 8px 32px rgba(78,205,196,0.25);
  flex-shrink: 0;
}
.pp-avatar img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* ── Name / city ── */
.pp-name {
  font-family: var(--serif);
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.5px;
  color: var(--pg-white);
  margin: 0;
}
.pp-city {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--pg-white-dim);
  margin-top: 6px;
}
.pp-city svg { color: var(--teal); }

/* ── Content body ── */
.pp-body {
  padding: 0 24px;
  margin-top: -40px;
  position: relative;
  z-index: 1;
}

/* ── Stats grid ── */
.pp-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 28px;
}
.pp-stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  padding: 22px 16px;
  text-align: center;
  transition: all 0.3s;
}
.pp-stat-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
}
.pp-stat-icon {
  color: var(--teal);
  margin-bottom: 10px;
}
.pp-stat-value {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 400;
  color: var(--pg-white);
  line-height: 1;
}
.pp-stat-label {
  font-size: 11px;
  color: var(--pg-white-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 6px;
}

/* ── Section card (interests, bio) ── */
.pp-section {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 20px;
}
.pp-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--pg-white-dim);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 16px;
}
.pp-section-title svg { color: var(--teal); }

/* ── Interest chips ── */
.pp-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.pp-interest-chip {
  padding: 8px 18px;
  background: rgba(78,205,196,0.1);
  border: 1px solid rgba(78,205,196,0.15);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: var(--teal);
  transition: all 0.25s;
}
.pp-interest-chip:hover {
  background: rgba(78,205,196,0.2);
  border-color: rgba(78,205,196,0.3);
}

/* ── Action buttons ── */
.pp-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  padding-bottom: 32px;
}
.pp-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--sans);
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}
.pp-action-primary {
  background: var(--teal);
  color: var(--bg);
}
.pp-action-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--teal-glow);
}
.pp-action-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.pp-action-ghost {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--pg-white);
}
.pp-action-ghost:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.18);
}
.pp-action-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pp-action-status {
  background: rgba(78,205,196,0.1);
  border: 1px solid rgba(78,205,196,0.15);
  color: var(--teal);
  cursor: default;
}
.pp-action-pending {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white-dim);
  cursor: default;
}

/* ── Loading / empty states ── */
.pp-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
}
.pp-loader {
  font-size: 14px;
  color: var(--pg-white-muted);
  letter-spacing: 1px;
}
.pp-empty-text {
  font-size: 15px;
  color: var(--pg-white-dim);
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .pp-hero { min-height: 280px; padding: 24px 20px 64px; }
  .pp-body { padding: 0 20px; }
  .pp-back { top: 16px; left: 16px; }
}
`;

/* ── Types ── */
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

interface UserFollows {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export default function PublicProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const containerRef = useFadeUp("pp");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState<number>(0);
  const [friendStatus, setFriendStatus] = useState<"not_friends" | "friends" | "pending_sent" | "pending_received">("not_friends");
  const [actionLoading, setActionLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Extract profile ID from URL path (/profil/UUID)
  const pathParts = typeof window !== "undefined" ? window.location.pathname.split("/") : [];
  const profileId = pathParts[pathParts.length - 1];

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
          await checkFollowStatus(user.id, profileId);
        }

        // Fetch follower count
        try {
          const { count } = await supabase
            .from("user_follows")
            .select("follower_id", { count: "exact", head: true })
            .eq("following_id", profileId);
          if (count !== null) {
            setFollowerCount(count);
          }
        } catch {
          // Table may not exist yet
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

  const checkFollowStatus = async (currentUserId: string, targetUserId: string) => {
    try {
      const { data } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .single();

      setIsFollowing(!!data);
    } catch (err) {
      console.error("Error checking follow status:", err);
      setIsFollowing(false);
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

  const handleToggleFollow = async () => {
    if (!user?.id || !profileId) return;
    setActionLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileId);
        if (error) throw error;
        setIsFollowing(false);
        setFollowerCount(Math.max(0, followerCount - 1));
      } else {
        // Follow
        const { error } = await supabase
          .from("user_follows")
          .insert({
            follower_id: user.id,
            following_id: profileId,
          });
        if (error) throw error;
        setIsFollowing(true);
        setFollowerCount(followerCount + 1);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
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

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="pp-root" ref={containerRef}>
        <style>{publicProfileCSS}</style>
        <div className="pp-center">
          <div className="pp-loader">Indl&aelig;ser...</div>
        </div>
      </div>
    );
  }

  /* ── Not found state ── */
  if (!profile) {
    return (
      <div className="pp-root" ref={containerRef}>
        <style>{publicProfileCSS}</style>
        <div className="pp-center">
          <p className="pp-empty-text">Profil ikke fundet</p>
          <button className="pp-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Tilbage
          </button>
        </div>
      </div>
    );
  }

  /* ── Main profile view ── */
  return (
    <div className="pp-root" ref={containerRef}>
      <style>{publicProfileCSS}</style>

      {/* Hero with background image */}
      <div className="pp-hero">
        <button className="pp-back" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
        </button>

        <div className="pp-hero-inner pp-fade-up">
          {false /* no avatar_url column */ ? (
            <div className="pp-avatar">
              <img
                src={false as unknown as string}
                alt={profile?.display_name || "Bruger"}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="pp-avatar">{displayInitial}</div>
          )}
          <div>
            <h1 className="pp-name">{profile.display_name || "Bruger"}</h1>
            {profile.home_city && (
              <p className="pp-city">
                <MapPin size={14} /> {profile.home_city}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="pp-body">
        {/* Stats cards */}
        <div className="pp-stats pp-fade-up pp-d1">
          <div className="pp-stat-card">
            <Users size={20} className="pp-stat-icon" />
            <p className="pp-stat-value">{friendCount}</p>
            <p className="pp-stat-label">Venner</p>
          </div>
          <div className="pp-stat-card">
            <Heart size={20} className="pp-stat-icon" />
            <p className="pp-stat-value">{followerCount}</p>
            <p className="pp-stat-label">Følgere</p>
          </div>
        </div>

        {/* Bio */}
        {false /* no bio column */ && (
          <div className="pp-section pp-fade-up pp-d2">
            <p className="pp-text">{false /* no bio column */}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="pp-section pp-fade-up pp-d2">
            <h3 className="pp-section-title">
              <Heart size={16} />
              Interesser
            </h3>
            <div className="pp-interests">
              {profile.interests.map(interest => (
                <span key={interest} className="pp-interest-chip">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="pp-actions pp-fade-up pp-d3">
          {friendStatus === "not_friends" && (
            <button
              onClick={handleAddFriend}
              disabled={actionLoading}
              className="pp-action-btn pp-action-primary"
            >
              <UserPlus size={18} />
              {actionLoading ? "Tilf\u00f8jer..." : "Tilf\u00f8j ven"}
            </button>
          )}

          {friendStatus === "friends" && (
            <div className="pp-action-btn pp-action-status">
              <Users size={18} />
              I er venner ✓
            </div>
          )}

          {friendStatus === "pending_sent" && (
            <div className="pp-action-btn pp-action-pending">
              <Users size={18} />
              Anmodning sendt
            </div>
          )}

          {friendStatus === "pending_received" && (
            <>
              <button
                onClick={handleAcceptRequest}
                disabled={actionLoading}
                className="pp-action-btn pp-action-primary"
              >
                <UserPlus size={18} />
                {actionLoading ? "Accepterer..." : "Accept\u00e9r"}
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={actionLoading}
                className="pp-action-btn pp-action-ghost"
              >
                <X size={18} />
                Afvis
              </button>
            </>
          )}

          <button
            onClick={handleToggleFollow}
            disabled={actionLoading}
            className={`pp-action-btn ${isFollowing ? 'pp-action-ghost' : 'pp-action-primary'}`}
          >
            <Heart fill={isFollowing ? 'currentColor' : 'none'} size={18} />
            {isFollowing ? "Følger" : "Følg"}
          </button>

          <button
            onClick={handleSendMessage}
            className="pp-action-btn pp-action-ghost"
          >
            <Send size={18} />
            Send besked
          </button>
        </div>
      </div>
    </div>
  );
}
