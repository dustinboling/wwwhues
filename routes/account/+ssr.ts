// Session surface: no server HTML beyond the boot shell (ssr:false).
// Excluded from the sitemap (a shell is not an indexable); robots
// posture unchanged — /account stays crawlable per Bea §2.4,
// which disallows only the admin surfaces and /api/.
export default false
