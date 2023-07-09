<script lang="ts">
  import { Button, Tooltip, Spinner } from "flowbite-svelte";

  export let id: string;
  export let width: number;
  export let tooltip = "";
  export let text: string;
  export let loadingText = "Loading";
  export let loadingDelay = 1000;
  export let onClick: () => Promise<void>;

  enum State {
    Init,
    Clicked,
    Loading,
  }
  let state: State = State.Init;

  const _onClick = async () => {
    if (state !== State.Init) {
      return;
    }
    state = State.Clicked;
    const timeoutId = setTimeout(() => {
      if (state === State.Clicked) {
        state = State.Loading;
      }
    }, loadingDelay);
    try {
      await onClick();
    } finally {
      clearTimeout(timeoutId);
      state = State.Init;
    }
  };
</script>

<Button
  {id}
  outline
  color="primary"
  on:click={_onClick}
  class={`flex items-center justify-center w-${width}`}
>
  {#if state === State.Loading}
    <Spinner class="mr-3" size="4" color="white" />{loadingText}
  {:else}
    {text}
  {/if}
</Button>

<!-- tooltip -->
{#if state !== State.Init && tooltip !== ""}
  <Tooltip placement="bottom" trigger="click" triggeredBy={`#${id}`}>
    {tooltip}
  </Tooltip>
{/if}
