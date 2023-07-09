<script lang="ts">
  // @ts-nocheck
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
    Kbd,
    Input,
    ButtonGroup,
    Button,
    Chevron,
    Dropdown,
    DropdownItem,
    Badge,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  // import Toasts from "$lib/Toasts.svelte";
  // let toasts;
  import { Toaster, toast } from "svelte-sonner";

  import MyButton from "$lib/MyButton.svelte";

  import { PageT } from "$lib/types";

  const badgeClass =
    "w-5 h-4 ml-2 p-0 font-semibold text-primary-800 bg-white dark:text-gray-200 dark:bg-gray-700";

  // ctrl+k focus search input element
  const searchHotkey: string[] = ["ctrlKey", "k"];
  const searchHotKeyDisplay: string[] = ["ctrl", "k"];
  onMount(() => {
    const searchEl = document.getElementById("search");
    const handleKeydown = (event: KeyboardEvent) => {
      const isHotkeyPressed = searchHotkey.every(
        (key) => (event as any)[key] || event.key === key
      );
      if (isHotkeyPressed) {
        console.log(`hotkey pressed`);
        event.preventDefault(); // 防止浏览器默认处理
        searchEl?.focus();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });

  let pageData: PageT<any> = new PageT(1, 10);

  onMount(async () => {
    await firstPage();
  });

  // pagination
  const fetchPage = async (newPageNum: number) => {
    console.log(`fetchPage page_num: ${newPageNum}`);
    let offset = (newPageNum - 1) * pageData.pageSize;
    let limit = pageData.pageSize;
    let res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    if (!res.ok) {
      throw Error(`fetchPage respond failed, status=${res.status}`);
    }
    let content = await res.json();
    const itemTotal = content?.count ?? 0;
    const items = content?.results ?? [];
    return new PageT(newPageNum, 10, itemTotal, items);
  };
  const firstPage = async () => {
    try {
      pageData = await fetchPage(1);
    } catch (e: any) {
      // toasts.emitToast(e.message, "red");
      toast.error(e.message, { duration: 5000 });
    }
  };
  const prevPage = async () => {
    try {
      pageData = await fetchPage(Math.max(1, pageData.pageNum - 1));
    } catch (e: any) {
      // toasts.emitToast(e.message, "red");
      toast.error(e.message, { duration: 5000 });
    }
  };
  const nextPage = async () => {
    try {
      pageData = await fetchPage(
        Math.min(pageData.pageTotal, pageData.pageNum + 1)
      );
    } catch (e: any) {
      // toasts.emitToast(e.message, "red");
      toast.error(e.message, { duration: 5000 });
    }
  };

  // display
  const itemsDisplay = writable([]);
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
    const filteredItems = pageData.items.filter((item) => {
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
    itemsDisplay.set(sortedItems);
  }
</script>

<!-- toasts -->
<!-- <Toasts bind:this={toasts} /> -->
<Toaster
  theme="light"
  expand
  visibleToasts={9}
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
    <Input
      id="search"
      placeholder="Search"
      bind:value={searchTerm.value}
      class="h-full"
    >
      <div slot="right">
        {#each searchHotKeyDisplay as item}
          <Kbd class="px-2 py-1">{item}</Kbd>
        {/each}
      </div>
    </Input>
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
      <MyButton
        id="prevPage"
        width={28}
        tooltip="Take it easy, i am working ^_^"
        text="prev"
        onClick={prevPage}
      />
      <!-- next -->
      <MyButton
        id="nextPage"
        width={28}
        tooltip="Take it easy, i am working ^_^"
        text="next"
        onClick={nextPage}
      />
    </ButtonGroup>
    <!-- page metadata -->
    <ButtonGroup>
      <Button outline color="primary">
        page number:
        <Badge class={badgeClass}>{pageData.pageNum}</Badge>
      </Button>
      <Button outline color="primary">
        page size:
        <Badge class={badgeClass}>{pageData.pageSize}</Badge>
      </Button>
      <Button outline color="primary">
        page total:
        <Badge class={badgeClass}>{pageData.pageTotal}</Badge>
      </Button>
      <Button outline color="primary">
        items total:
        <Badge class={badgeClass}>{pageData.itemTotal}</Badge>
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
    {#each $itemsDisplay as item}
      <TableBodyRow>
        {#each displayKeys as key}
          <TableBodyCell>{item[key.field]}</TableBodyCell>
        {/each}
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
