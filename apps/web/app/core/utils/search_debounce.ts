/** The timer the debounce runs on: the browser's, or a fake one in a test. */
export interface Scheduler {
  set: (run: () => void, delay: number) => unknown
  clear: (handle: unknown) => void
}

const TIMERS: Scheduler = {
  set: (run, delay) => setTimeout(run, delay),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}

/**
 * The search box's debounce, outside React so it lives once per box: each
 * keystroke replaces the pending search, which runs `delay` ms after the
 * last one through `submit()` read at that moment (the latest filters, not
 * the ones of the render that typed). `received` says whether a value the
 * server sent back came from elsewhere (back/forward, another link), so the
 * box takes it, rather than from this box's own search, which may already be
 * behind what the person kept typing.
 */
export class SearchDebounce {
  private pending: unknown = null
  private sent: string

  constructor(
    private submit: () => (value: string) => void,
    initial: string,
    private delay = 300,
    private timers: Scheduler = TIMERS
  ) {
    this.sent = initial
  }

  type(value: string) {
    this.cancel()
    this.pending = this.timers.set(() => {
      this.pending = null
      this.sent = value.trim()
      this.submit()(this.sent)
    }, this.delay)
  }

  /** Searches `value` at once, dropping the pending one: clearing the box needs no wait. */
  now(value: string) {
    this.cancel()
    this.sent = value.trim()
    this.submit()(this.sent)
  }

  /** Whether `value`, from the page's props, is this box's own last search coming back. */
  isOwn(value: string): boolean {
    return value === this.sent
  }

  /**
   * Takes `value`, from the page's props, as the box's term when it came from
   * elsewhere: the pending search is dropped so it cannot undo that
   * navigation. Returns whether the box should show it.
   */
  received(value: string): boolean {
    if (this.isOwn(value)) return false
    this.cancel()
    this.sent = value
    return true
  }

  cancel() {
    if (this.pending !== null) this.timers.clear(this.pending)
    this.pending = null
  }
}
