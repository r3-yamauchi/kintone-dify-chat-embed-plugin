/*
 * This plugin is based on the sample code provided by Cybozu.
 * https://cybozu.dev/ja/kintone/ai/kintone-dify-plugin/
 * 
 * Original Code:
 * Copyright (c) 2025 Cybozu
 * Licensed under the MIT License
 * https://opensource.org/license/mit/
 */
(function (PLUGIN_ID) {
  'use strict';

  const CONFIG_KEY = 'shortcutSettings';

  const SCREEN_ACTIONS = {
    index: [
      'SHOW_RECORD',
      'FOCUS_SEARCH_BOX',
      'SHORTCUTS_HELP',
      'CREATE_RECORD',
      'EDIT_RECORD',
      'NEXT_RECORD',
      'PREVIOUS_RECORD',
      'NEXT_PAGE',
      'PREVIOUS_PAGE'
    ],
    record: [
      'FOCUS_SEARCH_BOX',
      'CANCEL_EDITING',
      'SHORTCUTS_HELP',
      'CREATE_RECORD',
      'EDIT_RECORD',
      'SHOW_VIEW',
      'SHOW_FILTER',
      'NEXT_RECORD',
      'PREVIOUS_RECORD',
      'SAVE_RECORD'
    ],
    create: [
      'FOCUS_SEARCH_BOX',
      'SHORTCUTS_HELP',
      'SAVE_RECORD'
    ]
  };

  const EVENT_MAP = {
    index: ['app.record.index.show'],
    record: ['app.record.detail.show', 'app.record.edit.show'],
    create: ['app.record.create.show']
  };

  function createDefaultSettings() {
    const base = {
      dify: {
        baseUrl: '',
        defaultToken: '',
        defaultWidth: ''
      },
      screens: {}
    };
    const screenIds = Object.keys(SCREEN_ACTIONS);
    for (let screenIndex = 0; screenIndex < screenIds.length; screenIndex += 1) {
      const screenId = screenIds[screenIndex];
      const actionIds = SCREEN_ACTIONS[screenId];
      const actionDefaults = {};
      for (let actionIndex = 0; actionIndex < actionIds.length; actionIndex += 1) {
        actionDefaults[actionIds[actionIndex]] = true;
      }
      base.screens[screenId] = {
        actions: actionDefaults,
        dify: {
          enabled: screenId === 'index',
          token: '',
          width: ''
        }
      };
    }
    return base;
  }

  function loadSettings() {
    const defaults = createDefaultSettings();
    const rawConfig = kintone.plugin.app.getConfig(PLUGIN_ID) || {};

    if (!rawConfig[CONFIG_KEY]) {
      return defaults;
    }

    try {
      const parsed = JSON.parse(rawConfig[CONFIG_KEY]);

      // Handle old format
      if (!parsed.screens && !parsed.dify) {
        const screenIds = Object.keys(parsed);
        for (let i = 0; i < screenIds.length; i++) {
          const sId = screenIds[i];
          if (defaults.screens[sId]) {
            defaults.screens[sId].actions = parsed[sId];
          }
        }
        return defaults;
      }

      // Merge settings
      if (parsed.dify) {
        defaults.dify = { ...defaults.dify, ...parsed.dify };
      }

      if (parsed.screens) {
        const screenIds = Object.keys(SCREEN_ACTIONS);
        for (let i = 0; i < screenIds.length; i++) {
          const sId = screenIds[i];
          if (parsed.screens[sId]) {
            if (parsed.screens[sId].actions) {
              defaults.screens[sId].actions = { ...defaults.screens[sId].actions, ...parsed.screens[sId].actions };
            }
            if (parsed.screens[sId].dify) {
              defaults.screens[sId].dify = { ...defaults.screens[sId].dify, ...parsed.screens[sId].dify };
            }
          }
        }
      }
    } catch (error) {
      console.warn('ショートカット設定の読み込みに失敗', error);
    }
    return defaults;
  }

  function composePayload(actionSettings, actionIds) {
    let allEnabled = true;
    let allDisabled = true;
    const payload = {};

    for (let index = 0; index < actionIds.length; index += 1) {
      const actionId = actionIds[index];
      const enabled = Boolean(actionSettings[actionId]);
      payload[actionId] = enabled;
      if (enabled) {
        allDisabled = false;
      } else {
        allEnabled = false;
      }
    }

    if (allEnabled) {
      return true;
    }
    if (allDisabled) {
      return false;
    }
    return payload;
  }

  async function applyShortcuts(screenId, settings) {
    const actionIds = SCREEN_ACTIONS[screenId];
    if (!actionIds || actionIds.length === 0) {
      return;
    }

    const screenSettings = settings.screens[screenId] || {};
    const actions = screenSettings.actions || {};

    const payload = composePayload(actions, actionIds);
    try {
      await kintone.setKeyboardShortcuts(payload);
    } catch (error) {
      console.error(`ショートカット設定の適用に失敗しました (${screenId})`, error);
    }
  }

  function removeExistingDify() {
    const existingScript = document.getElementById('dify-chatbot-script');
    if (existingScript) {
      existingScript.remove();
    }
    const existingStyle = document.getElementById('dify-custom-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    const existingBubble = document.getElementById('dify-chatbot-bubble-window');
    if (existingBubble) {
      existingBubble.remove();
    }
    const existingButton = document.getElementById('dify-chatbot-bubble-button');
    if (existingButton) {
      existingButton.remove();
    }
    // Clean up window object
    if (window.difyChatbotConfig) {
      delete window.difyChatbotConfig;
    }
  }

  function embedDify(globalDifySettings, screenDifySettings) {
    removeExistingDify();

    if (!screenDifySettings || !screenDifySettings.enabled) {
      return;
    }

    const baseUrl = globalDifySettings.baseUrl || 'https://udify.app';

    const token = screenDifySettings.token || globalDifySettings.defaultToken;
    if (!token) {
      console.warn('Dify Token is not configured.');
      return;
    }

    const rawWidth = screenDifySettings.width || globalDifySettings.defaultWidth;
    const width = rawWidth ? (/^\d+$/.test(rawWidth) ? rawWidth + 'px' : rawWidth) : '600px';

    // Dify Config
    window.difyChatbotConfig = {
      token: token,
      baseUrl: baseUrl,
      systemVariables: {},
      userVariables: {},
      dynamicScript: true,
    };

    // Script
    const script = document.createElement('script');
    script.id = 'dify-chatbot-script';
    script.src = `${baseUrl}/embed.min.js`;
    script.defer = true;
    document.body.appendChild(script);

    // Style
    const style = document.createElement('style');
    style.id = 'dify-custom-style';
    style.textContent = `
      #dify-chatbot-bubble-button {
        background-color: #1C64F2 !important;
      }
      #dify-chatbot-bubble-window {
        width: ${width} !important;
        height: 40rem !important;
      }
    `;
    document.head.appendChild(style);
  }

  function registerEventHandlers(settings) {
    const screenIds = Object.keys(EVENT_MAP);
    for (let screenIndex = 0; screenIndex < screenIds.length; screenIndex += 1) {
      const screenId = screenIds[screenIndex];
      const events = EVENT_MAP[screenId];
      kintone.events.on(events, async (event) => {
        await applyShortcuts(screenId, settings);

        const screenSettings = settings.screens[screenId] || {};
        embedDify(settings.dify, screenSettings.dify);

        return event;
      });
    }
  }

  const settings = loadSettings();
  registerEventHandlers(settings);
})(kintone.$PLUGIN_ID);
