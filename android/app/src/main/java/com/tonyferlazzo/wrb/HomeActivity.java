package com.tonyferlazzo.wrb;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ShortcutInfo;
import android.content.pm.ShortcutManager;
import android.graphics.Color;
import android.graphics.drawable.Icon;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Native entry point and a recoverable home-screen icon flow for the existing WRB app. */
public class HomeActivity extends Activity {
    private static final String SHORTCUT_ID = "wrb-home";
    private TextView status;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        boolean setup = getIntent().getData() != null && "setup".equals(getIntent().getData().getHost());
        boolean open = getIntent().getData() != null && "open".equals(getIntent().getData().getHost());
        if (open || (!setup && getPreferences(MODE_PRIVATE).getBoolean("setupSeen", false))) {
            openBuddy();
            return;
        }
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setGravity(Gravity.CENTER);
        int pad = (int) (24 * getResources().getDisplayMetrics().density);
        panel.setPadding(pad, pad, pad, pad);
        panel.setBackgroundColor(Color.rgb(16, 24, 32));
        ImageView image = new ImageView(this);
        image.setImageResource(R.drawable.launcher_icon);
        panel.addView(image, new LinearLayout.LayoutParams(pad * 4, pad * 4));
        TextView title = new TextView(this);
        title.setText("Waiting Room Buddy");
        title.setTextColor(Color.WHITE);
        title.setTextSize(28);
        title.setGravity(Gravity.CENTER);
        panel.addView(title);
        status = new TextView(this);
        status.setTextColor(Color.WHITE);
        status.setTextSize(20);
        status.setPadding(0, pad, 0, pad);
        status.setGravity(Gravity.CENTER);
        panel.addView(status);
        Button pin = new Button(this);
        pin.setText("Add home-screen icon");
        pin.setTextSize(20);
        pin.setOnClickListener(view -> pinIcon());
        panel.addView(pin, new LinearLayout.LayoutParams(-1, -2));
        Button openButton = new Button(this);
        openButton.setText("Open Waiting Room Buddy");
        openButton.setTextSize(20);
        openButton.setOnClickListener(view -> {
            getPreferences(MODE_PRIVATE).edit().putBoolean("setupSeen", true).apply();
            openBuddy();
        });
        panel.addView(openButton, new LinearLayout.LayoutParams(-1, -2));
        setContentView(panel);
        updateStatus();
    }

    @Override public void onResume() {
        super.onResume();
        if (status != null) updateStatus();
    }

    private boolean isPinned() {
        if (Build.VERSION.SDK_INT < 26) return false;
        ShortcutManager manager = getSystemService(ShortcutManager.class);
        if (manager == null) return false;
        for (ShortcutInfo shortcut : manager.getPinnedShortcuts()) {
            if (SHORTCUT_ID.equals(shortcut.getId())) return true;
        }
        return false;
    }

    private void updateStatus() {
        status.setText(isPinned()
            ? "The WRB home-screen icon is ready. You can open Buddy from it."
            : "WRB is installed. Add its icon directly to your home screen here.");
    }

    private void pinIcon() {
        if (Build.VERSION.SDK_INT < 26) {
            status.setText("This Android version does not support adding the icon from inside the app. WRB remains available in your apps.");
            return;
        }
        ShortcutManager manager = getSystemService(ShortcutManager.class);
        if (manager == null || !manager.isRequestPinShortcutSupported()) {
            status.setText("Your home-screen launcher does not allow apps to request an icon. You can still open Buddy with the button below.");
            return;
        }
        if (isPinned()) { updateStatus(); return; }
        Intent launch = new Intent(this, HomeActivity.class);
        launch.setAction(Intent.ACTION_VIEW);
        launch.setData(Uri.parse("wrb://open"));
        ShortcutInfo shortcut = new ShortcutInfo.Builder(this, SHORTCUT_ID)
            .setShortLabel("WRB")
            .setLongLabel("Waiting Room Buddy")
            .setIcon(Icon.createWithResource(this, R.drawable.launcher_icon))
            .setIntent(launch)
            .build();
        try {
            boolean requested = manager.requestPinShortcut(shortcut, null);
            status.setText(requested
                ? "Approve Android's Add to home screen prompt. The icon is added after you approve it."
                : "Android could not request the icon. You can retry or open Buddy below.");
        } catch (IllegalStateException | SecurityException error) {
            status.setText("Android could not request the icon. You can retry or open Buddy below.");
        }
    }

    private void openBuddy() {
        Intent buddy = new Intent(Intent.ACTION_VIEW, Uri.parse("https://waitingroombuddy.netlify.app/"));
        buddy.setClassName(this, "com.google.androidbrowserhelper.trusted.LauncherActivity");
        buddy.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(buddy);
        finish();
    }
}
