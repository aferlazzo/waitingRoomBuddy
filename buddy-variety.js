(function (root) {
  const topics = [
    'the history of mechanical clocks', 'how glass is made', 'ancient water engineering',
    'the science of musical instruments', 'navigation before GPS', 'the origins of everyday punctuation',
    'how seeds travel', 'unusual public libraries', 'the invention of refrigeration',
    'restoring old paintings', 'the geology of caves', 'how bridges handle movement',
    'the history of board games', 'photography before digital cameras', 'how weaving works',
    'the design of railway stations', 'the science of soap', 'the history of street lighting',
    'how deserts bloom', 'the craft of bookbinding', 'the history of calendars',
    'the physics of rainbows', 'how postage stamps developed', 'traditional boat building',
    'the science of fermentation', 'how mountains form', 'the history of measurement',
    'the engineering of elevators', 'how paper is recycled', 'the history of cinema sound',
    'the mathematics of tiling', 'the craft of stained glass', 'how migrating birds navigate',
    'the history of fire lookouts', 'the science of snow crystals', 'how musical notation evolved',
    'the engineering of tunnels', 'the history of public parks', 'how fossils are preserved',
    'the invention of zippers', 'how lighthouses work', 'the history of botanical gardens',
    'the physics of spinning tops', 'the craft of metal casting', 'how maps were printed',
    'the history of sign language', 'the science of tides', 'how ancient roads were built',
    'the design of concert halls', 'the history of pencils', 'how wildfires shape ecosystems',
    'the craft of ceramics', 'the history of weather forecasting', 'how sundials work',
    'the engineering of dams', 'the origins of food preservation', 'how pigments get their colors',
    'the history of telescopes', 'the physics of bicycle balance', 'how archaeology dates objects',
    'the history of puppetry', 'the craft of stone carving', 'how wetlands clean water',
    'the invention of safety matches'
  ];
  function createMemory(storage, random = Math.random) {
    const key = 'wrb-story-memory-v1';
    let state = {seen: [], recent: []};
    try {
      const saved = JSON.parse(storage.getItem(key) || '{}');
      if (Array.isArray(saved.seen)) state.seen = [...new Set(saved.seen.filter(i => Number.isInteger(i) && i >= 0 && i < topics.length))];
      if (Array.isArray(saved.recent)) state.recent = saved.recent.filter(t => typeof t === 'string').map(t => t.slice(0, 350)).slice(-30);
    } catch (_) {}
    return {
      next() {
        const available = topics.map((_, i) => i).filter(i => !state.seen.includes(i));
        // Explore every subject before restarting, keeping the latest subjects out of the new cycle.
        const pool = available.length ? available : topics.map((_, i) => i).filter(i => !state.seen.slice(-8).includes(i));
        return pool[Math.floor(random() * pool.length)];
      },
      recent() { return state.recent.slice(); },
      remember(topicId, text) {
        if (Number.isInteger(topicId) && topicId >= 0 && topicId < topics.length) {
          if (state.seen.length >= topics.length) state.seen = state.seen.slice(-8);
          state.seen = state.seen.filter(i => i !== topicId).concat(topicId);
        }
        state.recent = state.recent.concat(String(text).slice(0, 350)).slice(-30);
        try { storage.setItem(key, JSON.stringify(state)); } catch (_) {}
      }
    };
  }
  const api = {topics, createMemory};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WRBVariety = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
