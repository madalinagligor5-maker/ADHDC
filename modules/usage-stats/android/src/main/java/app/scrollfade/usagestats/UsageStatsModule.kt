package app.scrollfade.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Reads foreground time per app from Android's UsageStatsManager.
 * Requires the special "Usage access" permission (PACKAGE_USAGE_STATS), which
 * the user grants from system settings. Nothing leaves the device.
 */
class UsageStatsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is not available")

  override fun definition() = ModuleDefinition {
    Name("ScrollFadeUsageStats")

    Function("hasPermission") {
      hasUsageAccess()
    }

    Function("openUsageAccessSettings") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
    }

    // Returns foreground minutes per package between startMs and endMs.
    AsyncFunction("getForegroundMinutes") { packages: List<String>, startMs: Double, endMs: Double ->
      if (!hasUsageAccess()) {
        throw SecurityException("Usage access not granted")
      }
      foregroundMinutes(packages.toSet(), startMs.toLong(), endMs.toLong())
    }
  }

  private fun hasUsageAccess(): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  @Suppress("DEPRECATION")
  private fun foregroundMinutes(packages: Set<String>, startMs: Long, endMs: Long): Map<String, Double> {
    val manager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val now = minOf(endMs, System.currentTimeMillis())
    val events = manager.queryEvents(startMs, now)
    val event = UsageEvents.Event()
    val openedAt = mutableMapOf<String, Long>()
    val totals = mutableMapOf<String, Long>()

    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      val pkg = event.packageName ?: continue
      if (pkg !in packages) continue
      when (event.eventType) {
        // MOVE_TO_FOREGROUND/BACKGROUND share their values with ACTIVITY_RESUMED/PAUSED (API 29+).
        UsageEvents.Event.MOVE_TO_FOREGROUND -> openedAt.putIfAbsent(pkg, event.timeStamp)
        UsageEvents.Event.MOVE_TO_BACKGROUND -> openedAt.remove(pkg)?.let { start ->
          totals[pkg] = (totals[pkg] ?: 0L) + (event.timeStamp - start)
        }
      }
    }
    // Apps still in the foreground at query time.
    openedAt.forEach { (pkg, start) -> totals[pkg] = (totals[pkg] ?: 0L) + (now - start) }

    return packages.associateWith { pkg -> (totals[pkg] ?: 0L) / 60000.0 }
  }
}
