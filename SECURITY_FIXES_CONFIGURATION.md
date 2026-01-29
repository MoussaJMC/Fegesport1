# Security Configuration Required in Supabase Dashboard

This document outlines security issues that have been **automatically fixed via migrations** and those that require **manual configuration** in the Supabase Dashboard.

## ✅ Fixed via Migrations

The following issues have been automatically resolved:

### 1. Performance: Unindexed Foreign Keys
**Status:** FIXED ✓

Added indexes for:
- `event_registrations.member_id` → `idx_event_registrations_member_id`
- `members.user_id` → `idx_members_user_id`
- `news.author_id` → `idx_news_author_id`
- `static_files.uploaded_by` → `idx_static_files_uploaded_by`

**Migration:** `fix_foreign_key_indexes_and_cleanup.sql`

### 2. Cleanup: Unused Indexes
**Status:** FIXED ✓

Removed unused indexes:
- `idx_file_usage_file_id`
- `idx_profiles_user_id_new`

**Migration:** `fix_foreign_key_indexes_and_cleanup.sql`

### 3. Security: Multiple Permissive Policies
**Status:** FIXED ✓

Consolidated duplicate RLS policies for all tables to prevent unintended access patterns:
- cards, events, leadership_team, membership_types
- page_sections, pages, partners, site_settings
- slideshow_images, static_files, streams
- event_registrations, members, news, newsletter_subscriptions

**Migrations:**
- `consolidate_duplicate_rls_policies_part1.sql`
- `consolidate_duplicate_rls_policies_part2.sql`

### 4. Security: Function Search Path Mutable
**Status:** FIXED ✓

Set explicit `search_path` for all SECURITY DEFINER functions:
- `update_file_usage`
- `bucket_exists`
- `cleanup_unused_files`
- `get_file_statistics`

**Migration:** `fix_function_search_path_security.sql`

---

## ⚠️ Requires Manual Configuration

The following issues require changes in the Supabase Dashboard:

### 1. Auth DB Connection Strategy Not Percentage-Based
**Severity:** Medium
**Current State:** Fixed at 10 connections
**Recommended Action:** Switch to percentage-based allocation

#### How to Fix:
1. Go to Supabase Dashboard → Project Settings → Database
2. Navigate to Connection Pooling settings
3. Change Auth server connection strategy from "Fixed" to "Percentage"
4. Set an appropriate percentage (recommended: 5-10%)

**Why:** Allows Auth server to scale connections automatically when you upgrade instance size.

---

### 2. Auth OTP Long Expiry
**Severity:** Medium
**Current State:** OTP expiry > 1 hour
**Recommended Action:** Reduce to less than 1 hour

#### How to Fix:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Find the "Magic Link" or "OTP" settings
3. Set expiry time to 3600 seconds (1 hour) or less
4. Recommended: 900 seconds (15 minutes) for better security

**Why:** Shorter expiry windows reduce the attack surface for intercepted OTPs.

---

### 3. Leaked Password Protection Disabled
**Severity:** HIGH ⚠️
**Current State:** Disabled
**Recommended Action:** Enable immediately

#### How to Fix:
1. Go to Supabase Dashboard → Authentication → Policies
2. Find "Password Protection" or "Leaked Password Detection"
3. Enable "Check passwords against HaveIBeenPwned database"
4. Save changes

**Why:** Prevents users from using compromised passwords that have appeared in data breaches.

**Impact:** This is a critical security feature that should be enabled to protect user accounts.

---

### 4. Postgres Version Has Security Patches Available
**Severity:** HIGH ⚠️
**Current State:** Running `supabase-postgres-17.4.1.037`
**Recommended Action:** Upgrade to latest version

#### How to Fix:
1. Go to Supabase Dashboard → Project Settings → General
2. Look for "Database Version" section
3. If an upgrade is available, follow the upgrade wizard
4. Schedule upgrade during low-traffic period

**Note:** Database upgrades may require brief downtime. Always:
- Test in staging environment first
- Backup database before upgrading
- Schedule during maintenance window
- Verify application compatibility

**Why:** Security patches address vulnerabilities and improve system stability.

---

## Priority Recommendations

### Immediate Action (Do Now)
1. **Enable Leaked Password Protection** - Critical security feature
2. **Review Auth OTP Expiry** - Reduce to under 1 hour

### Plan for Next Maintenance Window
1. **Upgrade Postgres Version** - Apply security patches
2. **Switch Auth Connection Strategy** - Enable percentage-based allocation

---

## Verification

After applying manual configuration changes, verify:

```bash
# Check auth settings
supabase status

# Review security policies
# Go to Dashboard → Database → Policies
```

---

## Summary

| Issue | Status | Action Required |
|-------|--------|-----------------|
| Unindexed Foreign Keys | ✅ Fixed | None |
| Unused Indexes | ✅ Fixed | None |
| Multiple Permissive Policies | ✅ Fixed | None |
| Function Search Path | ✅ Fixed | None |
| Auth Connection Strategy | ⚠️ Manual | Dashboard Config |
| Auth OTP Expiry | ⚠️ Manual | Dashboard Config |
| Leaked Password Protection | 🔴 Manual | **Enable Now** |
| Postgres Version | 🔴 Manual | **Upgrade Soon** |

---

**Last Updated:** 2026-01-29
**Migrations Applied:** 3 new migrations
**Manual Actions Required:** 4
