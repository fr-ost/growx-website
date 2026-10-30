/**
 * Convenience re-exports of the lightweight motion primitives (no CSS modules here).
 * Prefer importing each module by path (e.g. "@/components/motion/stage"): it keeps
 * client bundles minimal. Mini-demos are deliberately NOT re-exported, so a page only
 * ships the demo CSS it imports by path ("@/components/motion/demos/<name>").
 */
export { stagger, cssVars } from "./stagger";
export { SettleWords } from "./settle-words";
export { Backdrop } from "./backdrop";
export { Aurora } from "./aurora";
export { LightBeams } from "./light-beams";
export { BorderBeam } from "./border-beam";
export { Stage3D } from "./stage";
export { GrowthLine } from "./growth-line";
export { StepRail, type RailStep } from "./step-rail";
export { CountUp } from "./count-up";
export { WordRoll } from "./word-roll";
export { Marquee } from "./marquee";
export { Kbd } from "./kbd";
export { InkStage } from "./ink-stage";
export { ScrollStory, type StoryStep } from "./scroll-story";
export { ScrollProgress } from "./scroll-progress";
export { Wordmark } from "./wordmark";
export { ToolGlyph, toolKey, type ToolKey } from "./tool-glyph";
export { ScrollSpy } from "./scroll-spy";
export { MotionToggle } from "./motion-toggle";
export { MotionRuntime } from "./motion-runtime";
