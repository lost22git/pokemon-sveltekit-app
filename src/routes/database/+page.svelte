<script lang="ts">
  //@ts-nocheck
  import { writable } from "svelte/store";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";

  import {
    Input,
    ButtonGroup,
    Button,
    Chevron,
    Dropdown,
    DropdownItem,
    Badge,
    Spinner,
    Tooltip,
  } from "flowbite-svelte";
  // import Toasts from "$lib/Toasts.svelte";
  // let toasts;
  import { Toaster, toast } from "svelte-sonner";

  const badgeClass =
    "w-5 h-4 ml-2 p-0 font-semibold text-primary-800 bg-white dark:text-gray-200 dark:bg-gray-700";

  export let data; // data from page.ts load()
  let items = data?.content?.results ?? [];
  let itemsTotal = data?.content?.count ?? 0;
  const displayItems = writable([]);

  // display
  const displayKeys = [
    { field: "name", text: "NAME" },
    { field: "url", text: "URL" },
  ];
  // search
  let searchDropdownOpen = false;
  const searchTermKeys = [
    { field: "all", text: "ALL" },
    { field: "name", text: "NAME" },
    { field: "url", text: "URL" },
  ];
  let searchTerm = { key: searchTermKeys[0], value: "" };
  const updateSearchTerm = (v) => {
    searchTerm.key = v;
    searchDropdownOpen = false;
  };
  // sort
  const sortKeys = [
    { field: "name", text: "NAME" },
    { field: "url", text: "URL" },
  ];
  let sortTerm = { key: sortKeys[0], direction: 1 };
  const updateSortTerm = (key) => {
    if (sortTerm.key === key) {
      sortTerm.direction = -sortTerm.direction;
    } else {
      sortTerm.key = key;
      sortTerm.direction = 1;
    }
  };
  // watch vars and rerun
  $: {
    console.log(`items or searchTerm or sortKey or sortDirection updated`);
    const filteredItems = items.filter((item) => {
      const field = searchTerm.key.field;
      const matchValue = searchTerm.value.toLowerCase();
      if (field == "all") {
        return searchTermKeys
          .filter((v) => v.field !== "all")
          .some((v) => item[v.field].toLowerCase().indexOf(matchValue) !== -1);
      } else {
        return item[field].toLowerCase().indexOf(matchValue) !== -1;
      }
    });
    const key = sortTerm.key.field;
    const direction = sortTerm.direction;
    const sortedItems = filteredItems.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) {
        return -direction;
      } else if (aVal > bVal) {
        return direction;
      }
      return 0;
    });
    displayItems.set(sortedItems);
  }

  // pagination
  let pageNum = 1;
  let pageSize = 10;
  let pageTotal = Math.ceil(itemsTotal / pageSize);
  enum PageBtnStatus {
    Init,
    Clicked,
    Loading,
  }
  let prevPageBtnStatus: PageBtnStatus = PageBtnStatus.Init;
  let nextPageBtnStatus: PageBtnStatus = PageBtnStatus.Init;
  let prevPageLoadingDelay = 300;
  let nextPageLoadingDelay = 300;
  const updatePageNum = async (newPageNum) => {
    console.log(`page_num updated: ${newPageNum}`);
    pageNum = newPageNum;
    let offset = (pageNum - 1) * pageSize;
    let limit = pageSize;
    let res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    if (!res.ok) {
      throw Error(`data fetching respond failed, status=${res.status}`);
    }
    let content = await res.json();
    items = content?.results ?? [];
    itemsTotal = content?.count ?? 0;
    console.log(`items_total updated: ${itemsTotal}`);
    pageTotal = Math.ceil(itemsTotal / pageSize);
  };
  const prevPage = async () => {
    if (prevPageBtnStatus !== PageBtnStatus.Init) {
      return;
    }
    prevPageBtnStatus = PageBtnStatus.Clicked;
    const timeoutId = setTimeout(() => {
      if (prevPageBtnStatus === PageBtnStatus.Clicked) {
        prevPageBtnStatus = PageBtnStatus.Loading;
      }
    }, prevPageLoadingDelay);
    try {
      await updatePageNum(Math.max(1, pageNum - 1));
    } catch (e) {
      // toasts.emitToast(e.message, "red");
      toast.error(e.message, { duration: 5000 });
    } finally {
      clearTimeout(timeoutId);
      prevPageBtnStatus = PageBtnStatus.Init;
    }
  };
  const nextPage = async () => {
    if (nextPageBtnStatus !== PageBtnStatus.Init) {
      return;
    }
    nextPageBtnStatus = PageBtnStatus.Clicked;
    const timeoutId = setTimeout(() => {
      if (nextPageBtnStatus === PageBtnStatus.Clicked) {
        nextPageBtnStatus = PageBtnStatus.Loading;
      }
    }, nextPageLoadingDelay);
    try {
      await updatePageNum(Math.min(pageTotal, pageNum + 1));
    } catch (e) {
      // toasts.emitToast(e.message, "red");
      toast.error(e.message, { duration: 5000 });
    } finally {
      clearTimeout(timeoutId);
      nextPageBtnStatus = PageBtnStatus.Init;
    }
  };
</script>

<!-- toasts -->
<!-- <Toasts bind:this={toasts} /> -->
<Toaster
  theme="light"
  expand
  visibleToasts="9"
  position="top-right"
  richColors
/>

<div
  class="sticky top-10 z-40 flex flex-wrap space-x-10 space-y-3 justify-center"
>
  <!-- search -->
  <ButtonGroup class="flex-1">
    <Button
      color="none"
      class="flex-shrink-0 text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
    >
      <Chevron>{searchTerm.key.text}</Chevron>
    </Button>
    <Dropdown class="z-50" bind:open={searchDropdownOpen}>
      {#each searchTermKeys as item}
        <DropdownItem on:click={() => updateSearchTerm(item)}>
          {item.text}
        </DropdownItem>
      {/each}
    </Dropdown>
    <Input placeholder="Search" bind:value={searchTerm.value} />
    <Button tolor="primary" class="!p-2.5" type="submit">
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </Button>
  </ButtonGroup>
  <!-- pagination  -->
  <div class="flex flex-wrap flex-2">
    <ButtonGroup class="mr-10">
      <!-- prev -->
      <Button
        id="prevPage"
        outline
        color="primary"
        on:click={prevPage}
        class="w-28 flex items-center justify-center"
      >
        {#if prevPageBtnStatus === PageBtnStatus.Loading}
          <Spinner class="mr-3" size="4" color="white" />Loading
        {:else}
          prev
        {/if}
      </Button>
      <!-- next -->
      <Button
        id="nextPage"
        outline
        color="primary"
        on:click={nextPage}
        class="w-28 flex items-center justify-center"
      >
        {#if nextPageBtnStatus === PageBtnStatus.Loading}
          <Spinner class="mr-3" size="4" color="white" />Loading
        {:else}
          next
        {/if}
      </Button>
    </ButtonGroup>
    <!-- Tooltip -->
    {#if prevPageBtnStatus !== PageBtnStatus.Init}
      <Tooltip placement="bottom" trigger="click" triggeredBy="#prevPage">
        Take it easy, i am working ^_^
      </Tooltip>
    {/if}
    {#if nextPageBtnStatus !== PageBtnStatus.Init}
      <Tooltip placement="bottom" trigger="click" triggeredBy="#nextPage">
        Take it easy, i am working ^_^
      </Tooltip>
    {/if}
    <!-- page metadata -->
    <ButtonGroup>
      <Button outline color="primary">
        page number:
        <Badge class={badgeClass}>{pageNum}</Badge>
      </Button>
      <Button outline color="primary">
        page size:
        <Badge class={badgeClass}>{pageSize}</Badge>
      </Button>
      <Button outline color="primary">
        page total:
        <Badge class={badgeClass}>{pageTotal}</Badge>
      </Button>
      <Button outline color="primary">
        items total:
        <Badge class={badgeClass}>{itemsTotal}</Badge>
      </Button>
    </ButtonGroup>
  </div>
</div>

<br />

<!-- table -->
<Table color="default" hoverable={true}>
  <caption
    class="p-4 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800"
  >
    Pokemon Database
    <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
      The data comes from
      <Button outline pill size="xs" href="https://pokeapi.co/" class="ml-5">
        pokeapi.co
      </Button>
    </p>
  </caption>
  <TableHead>
    {#each displayKeys as item}
      <!-- TODO 不支持排序的字段没有该事件-->
      <TableHeadCell on:click={() => updateSortTerm(item)}>
        {item.text}
      </TableHeadCell>
    {/each}
  </TableHead>
  <TableBody>
    {#each $displayItems as item}
      <TableBodyRow>
        {#each displayKeys as key}
          <TableBodyCell>{item[key.field]}</TableBodyCell>
        {/each}
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
