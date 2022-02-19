<script lang="ts">
  import {getDay} from '$lib/match/match';
  import WalletAccess from '$lib/blockchain/WalletAccess.svelte';
  import {page} from '$app/stores';
  import {flow} from '$lib/blockchain/wallet';
  import {params} from '$lib/config';

  const match = getDay($page.params.id);

  const formatAddress = (address: string) => `${address.slice(0, 8)}...`;
  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toString();
  const duration = 120;
  async function requestVRF(matchId: string) {
    await flow.execute((contracts) => contracts.FootiumLiteTournament.requestSeed(matchId));
  }
</script>

<symbol id="icon-spinner6" viewBox="0 0 32 32">
  <path
    d="M12 4c0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4s-4-1.791-4-4zM24.719 16c0 0 0 0 0 0 0-1.812 1.469-3.281 3.281-3.281s3.281 1.469 3.281 3.281c0 0 0 0 0 0 0 1.812-1.469 3.281-3.281 3.281s-3.281-1.469-3.281-3.281zM21.513 24.485c0-1.641 1.331-2.972 2.972-2.972s2.972 1.331 2.972 2.972c0 1.641-1.331 2.972-2.972 2.972s-2.972-1.331-2.972-2.972zM13.308 28c0-1.487 1.205-2.692 2.692-2.692s2.692 1.205 2.692 2.692c0 1.487-1.205 2.692-2.692 2.692s-2.692-1.205-2.692-2.692zM5.077 24.485c0-1.346 1.092-2.438 2.438-2.438s2.438 1.092 2.438 2.438c0 1.346-1.092 2.438-2.438 2.438s-2.438-1.092-2.438-2.438zM1.792 16c0-1.22 0.989-2.208 2.208-2.208s2.208 0.989 2.208 2.208c0 1.22-0.989 2.208-2.208 2.208s-2.208-0.989-2.208-2.208zM5.515 7.515c0 0 0 0 0 0 0-1.105 0.895-2 2-2s2 0.895 2 2c0 0 0 0 0 0 0 1.105-0.895 2-2 2s-2-0.895-2-2zM28.108 7.515c0 2.001-1.622 3.623-3.623 3.623s-3.623-1.622-3.623-3.623c0-2.001 1.622-3.623 3.623-3.623s3.623 1.622 3.623 3.623z"
  />
</symbol>
<WalletAccess>
  <div class="py-8 px-4">
    <b>Match {$page.params.id}</b>
    {#if !$match.step}
      <div>match not loaded</div>
    {:else if $match.error}
      <div>Error: {$match.error}</div>
    {:else if $match.step === 'LOADING' || !$match.data}
      <div>
        <p>
          This day has not been created yet. Will take place on {formatDate(
            1645234628 + parseInt($page.params.id) * duration
          )}
        </p>
        <button
          on:click={() => requestVRF($page.params.id)}
          class="flex-shrink-0 bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700 text-sm border-4
              text-white py-1 px-2 rounded disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
          type="button"
        >
          Request VRF
        </button>
      </div>
    {:else}
      <div class="px-2">
        {#if $match.data.status === 0}
          <div>VRF not requested</div>
          <button
            on:click={() => requestVRF($page.params.id)}
            class="flex-shrink-0 bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700 text-sm border-4
                text-white py-1 px-2 rounded disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
            type="button"
          >
            Request VRF
          </button>
        {:else if $match.data.status === 1}
          <div>VRF not received</div>
          <div>Request ID: {$match.data.requestId}</div>
        {:else if $match.data.status === 2}
          <div>VRF received</div>
          <div>Request ID: {$match.data.requestId}</div>
          <div>Seed: {$match.data.randomNumber}</div>
        {:else}
          <div class="px-2">Fix me</div>
        {/if}
      </div>
    {/if}
  </div>
</WalletAccess>

<style>
  ::-webkit-input-placeholder {
    /* Chrome/Opera/Safari */
    color: gray;
    opacity: 0.5;
  }
  ::-moz-placeholder {
    /* Firefox 19+ */
    color: gray;
    opacity: 0.5;
  }
  :-ms-input-placeholder {
    /* IE 10+ */
    color: gray;
    opacity: 0.5;
  }
  :-moz-placeholder {
    /* Firefox 18- */
    color: gray;
    opacity: 0.5;
  }
  @media (prefers-color-scheme: dark) {
    ::-webkit-input-placeholder {
      /* Chrome/Opera/Safari */
      color: pink;
      opacity: 0.5;
    }
    ::-moz-placeholder {
      /* Firefox 19+ */
      color: pink;
      opacity: 0.5;
    }
    :-ms-input-placeholder {
      /* IE 10+ */
      color: pink;
      opacity: 0.5;
    }
    :-moz-placeholder {
      /* Firefox 18- */
      color: pink;
      opacity: 0.5;
    }
  }
</style>
