import { useEffect, useState } from "react";
import Storyblok from "./storyblok";

export default function useStoryblok(story, setStory) {
  // adds the events for updating the visual editor
  // see https://www.storyblok.com/docs/guide/essentials/visual-editor#initializing-the-storyblok-js-bridge
  function initEventListeners() {
    if (typeof window !== 'undefined' && window.storyblok) {
      window.storyblok.init();

      // reload on Next.js page on save or publish event in the Visual Editor
      window.storyblok.on(["change", "published"], () => location.reload(true));

      // live update the story on input events
      window.storyblok.on("input", (event) => {
        if (story.content && event.story.content._uid === story.content._uid) {
          event.story.content = window.storyblok.addComments(
            event.story.content,
            event.story.id
          );
          setStory(event.story);
        }
      });
    }
  }

  // appends the bridge script tag to our document
  // see https://www.storyblok.com/docs/guide/essentials/visual-editor#installing-the-storyblok-js-bridge
  function addBridge(callback) {
    if (typeof document !== 'undefined' && document.body) {
      // check if the script is already present
      const existingScript = document.getElementById("storyblokBridge");
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://app.storyblok.com/f/storyblok-latest.js?t=${Storyblok.accessToken}`;
        script.id = "storyblokBridge";
        document.body.appendChild(script);
        script.onload = () => {
          // once the scrip is loaded, init the event listeners
          callback();
        };
      } else {
        callback();
      }
    }
  }

  useEffect(() => {
    // first load the bridge, then initialize the event listeners
    addBridge(initEventListeners);
  });

  return story;
}