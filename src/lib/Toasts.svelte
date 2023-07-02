<script lang="ts">
  // @ts-nocheck
  import { Toast } from "flowbite-svelte";
  import { writable } from "svelte/store";

  let toastsIdGen = 0;
  const toasts = writable([]);
  $: displayToasts = [...$toasts].reverse();

  export const emitToast = (
    msg: string,
    color: string,
    timeoutMs?: number = 5000
  ) => {
    const id = toastsIdGen++;
    const value = {
      id: id,
      text: msg,
      color: color,
    };
    toasts.update((arr) => [...arr, value]);
    setTimeout(() => {
      $toasts = $toasts.filter((item) => item.id !== id);
    }, timeoutMs);
  };
</script>

<main>
  <div class="z-50 fixed top-10 right-10 flex flex-col space-y-10">
    {#each displayToasts as item}
      <Toast
        simple
        color={item.color}
        class={`border-2 border-${item.color}-600`}
      >
        <svg
          slot="icon"
          aria-hidden="true"
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        [{item.id}] {item.text}
      </Toast>
    {/each}
  </div>
</main>
