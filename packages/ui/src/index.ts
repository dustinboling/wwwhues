/**
 * @hues/ui public surface: the section-6 inventory, the programmatic
 * accessibility layer, and the shared data, security, and worker modules.
 * No toast stack, no carousel, no second button set.
 */

// Shell
export { AppShell } from './shell/AppShell';
export type { AppShellProps, ShellDensity } from './shell/AppShell';
export { TopBar } from './shell/TopBar';
export type { TopBarProps } from './shell/TopBar';
export { SiteHeader } from './shell/SiteHeader';
export type { NavItem, SiteHeaderProps } from './shell/SiteHeader';
export { SiteFooter } from './shell/SiteFooter';
export type { SiteFooterProps } from './shell/SiteFooter';
export { TabBar } from './shell/TabBar';
export type { TabDefinition, TabId, TabBarProps } from './shell/TabBar';
export { HUES_TABS } from './shell/tabs';
export { GameHeader } from './shell/GameHeader';
export type { GameHeaderProps } from './shell/GameHeader';
export { AdminShell } from './shell/AdminShell';
export type { AdminShellProps } from './shell/AdminShell';
export { Sheet } from './shell/Sheet';
export type { SheetProps } from './shell/Sheet';
export { Dialog } from './shell/Dialog';
export type { DialogProps } from './shell/Dialog';
export { MiniPlayer } from './shell/MiniPlayer';
export type { MiniPlayerProps, Track } from './shell/MiniPlayer';
export { UpdateNotice } from './shell/UpdateNotice';
export type { UpdateNoticeProps } from './shell/UpdateNotice';
export { OfflineBanner } from './shell/OfflineBanner';
export type { OfflineBannerProps } from './shell/OfflineBanner';

// Actions and navigation
export { Button } from './actions/Button';
export type { ButtonProps, ButtonVariant } from './actions/Button';
export { AccountButton } from './actions/AccountButton';
export type { AccountButtonProps } from './actions/AccountButton';
export { BackPill } from './actions/BackPill';
export { FilterChip, SingleFilterGroup } from './actions/FilterChip';
export type { FilterChipProps } from './actions/FilterChip';
export { SegmentedControl } from './actions/SegmentedControl';
export type { Segment, SegmentedControlProps } from './actions/SegmentedControl';
export { Accordion } from './actions/Accordion';
export type { AccordionItem, AccordionProps } from './actions/Accordion';
export { Pagination } from './actions/Pagination';
export type { PaginationProps } from './actions/Pagination';
export { FooterLink, SheetRow } from './actions/RowLinks';
export type { RowLinkProps } from './actions/RowLinks';

// Content
export { PacketCard } from './content/PacketCard';
export type { PacketCardProps, PacketCardRadius } from './content/PacketCard';
export { PlateFrame } from './content/PlateFrame';
export type { PlateFrameProps, PlateFrameSize } from './content/PlateFrame';
export { CardRail, RailEndCard } from './content/CardRail';
export type { CardRailProps, RailEndCardProps, RailEndCardVariant } from './content/CardRail';
export { PhoneHero } from './content/PhoneHero';
export type { PhoneHeroPhoto, PhoneHeroProps } from './content/PhoneHero';
export { StepNumeral } from './content/StepNumeral';
export type { StepNumeralProps } from './content/StepNumeral';
export { ContentCard } from './content/ContentCard';
export type { ContentCardProps } from './content/ContentCard';
export { FactCard } from './content/FactCard';
export type { FactCardProps, FactKind } from './content/FactCard';
export { StatusCard } from './content/StatusCard';
export type { StatusCardProps, StatusVariant } from './content/StatusCard';
export { FlowerCard } from './content/FlowerCard';
export type { FlowerCardProps } from './content/FlowerCard';
export { CultivarCard } from './content/CultivarCard';
export type { CultivarCardProps } from './content/CultivarCard';
export { GameCard } from './content/GameCard';
export type { GameCardProps } from './content/GameCard';
export { SponsorItemCard } from './content/SponsorItemCard';
export type { SponsorItemCardProps, SponsorStatus } from './content/SponsorItemCard';
export { EventCard } from './content/EventCard';
export type { EventCardProps } from './content/EventCard';
export { TrackRow, TRACK_LIST_PRELOAD } from './content/TrackRow';
export type { TrackRowProps } from './content/TrackRow';
export { EmptyState } from './content/EmptyState';
export type { EmptyStateProps, EmptyStateVariant } from './content/EmptyState';
export { ErrorRegion } from './content/ErrorRegion';
export type { ErrorRegionProps } from './content/ErrorRegion';
export { GoldRule, PerforationDivider } from './content/Dividers';

// Forms
export { TextField } from './forms/TextField';
export type { TextFieldProps } from './forms/TextField';
export { TextArea } from './forms/TextArea';
export type { TextAreaProps } from './forms/TextArea';
export { Select } from './forms/Select';
export type { SelectProps } from './forms/Select';
export { Checkbox, Radio } from './forms/Checks';
export type { CheckProps } from './forms/Checks';
export { FormDialog } from './forms/FormDialog';
export type { FormDialogProps } from './forms/FormDialog';
export { InlineForm } from './forms/InlineForm';
export type { InlineFormProps } from './forms/InlineForm';
export { FieldError } from './forms/FieldError';
export { FieldNote } from './forms/FieldNote';
export { SubmitBar } from './forms/SubmitBar';
export type { SubmitBarProps } from './forms/SubmitBar';

// Feedback and data
export { Skeleton } from './feedback/Skeleton';
export type { SkeletonProps } from './feedback/Skeleton';
export { NewItemsPill } from './feedback/NewItemsPill';
export { StaleLabel } from './feedback/StaleLabel';
export { UpdatedWash } from './feedback/UpdatedWash';
export { DataTable } from './feedback/DataTable';
export type { DataColumn, DataTableProps } from './feedback/DataTable';
export { SignupCard } from './feedback/SignupCard';
export { LiveRegion } from './feedback/LiveRegion';
export { Spinner } from './feedback/Spinner';

// Media
export { Image, heroPreloadLink } from './media/Image';
export type { ImageProps } from './media/Image';
export { PhotoBand } from './media/PhotoBand';
export type { PhotoBandKind, PhotoBandProps } from './media/PhotoBand';
export { SpotArt } from './media/SpotArt';
export type { SpotArtProps, SpotArtSize } from './media/SpotArt';
export { Link } from './media/Link';
export type { LinkProps } from './media/Link';
export { Icon } from './media/Icon';
export type { IconName, IconProps } from './media/Icon';

// Programmatic layer
export { cx } from './lib/cx';
export { focusableIn, focusRouteTarget, trapFocus, useFocusTrap, useReturnFocus } from './lib/focus';
export { useAnnouncer } from './lib/announce';
export type { Announce } from './lib/announce';
export { useOverlayHistory } from './lib/overlay-history';
export { matchesReducedMotion, usePrefersReducedMotion } from './lib/reduced-motion';
export { initRouteScroll, notifyRouteChange } from './lib/scroll';
export { markTabRevealed, readTabSnapshot, useTabState } from './lib/tab-state';
export type { TabSnapshot } from './lib/tab-state';
export { useRouteTransition } from './lib/route-transition';
export {
  MEDIA_SLOT_SIZES,
  MEDIA_WIDTH_LADDER,
  PHOTO_QUALITY,
  PLATE_QUALITY,
  getMediaBaseUrl,
  isMediaUrl,
  setMediaBaseUrl,
  srcSetFor,
  transformUrl,
} from './lib/media';
export type { MediaSlot, MediaWidth, TransformOptions } from './lib/media';

// Data layer
export { STALE_TIME, HUES_DEFAULT_OPTIONS, createHuesQueryClient, mutationOptionsFor, queryOptionsFor } from './data/query-preset';
export type { DataClass, HuesMutationOptions } from './data/query-preset';
export { cacheControlFor, etagFor, etagMatches, notModified, withResponseCaching } from './data/http-caching';
export type { ApiClass, PublicCacheOptions } from './data/http-caching';
export { VersionConflictError, mutateVersioned, rowActionAllowed } from './data/concurrency';
export type { VersionedRecord } from './data/concurrency';
export {
  createIdempotencyKey,
  enqueueMutation,
  mutationSyncTag,
  pendingMutations,
  replayQueuedMutations,
} from './data/mutation-queue';
export type { QueuedMutation, QueuedStatus, ReplayResult } from './data/mutation-queue';
export { PROHIBITED_JSONLD_KEYS, PROHIBITED_JSONLD_TYPES, ProhibitedJsonLdError, assertNoProhibitedJsonLd } from './data/jsonld-guard';

// Security
export { applySecurityHeaders, buildSecurityHeaders, contentSecurityPolicy, renderHeadersFile } from './security/headers';
export type { SecurityHeadersOptions } from './security/headers';
export { HUES_CSRF_HEADER, HUES_CSRF_VALUE } from './security/csrf';
export { captureError, configureErrorReporter, scrubExtra, toErrorReport } from './security/error-reporter';
export type { ErrorReport } from './security/error-reporter';

// Service worker policy (the sw-template.ts file itself is copied per property)
export { DENIED_PATH_PREFIXES, carriesSession, classifyRequest } from './sw/sw-policy';
export type { HuesWorkerConfig, RouteClass } from './sw/sw-policy';
export { LEGACY_KILL_SWITCH_SOURCE, deregisterLegacyWorkers, purgeServiceWorkerCaches } from './sw/kill-switch';
