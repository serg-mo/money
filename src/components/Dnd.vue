<template>
  <div>
    <input type="file" accept="application/json" @change="onFileChange" id="dnd" lass="ui basic modal" />

    <div>
      Drag and Drop<br />
      Transactions
    </div>
  </div>
</template>
<script type="text/javascript">
  export default {
    methods: {
      onFileChange(e) {
        let files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        this.readFile(files[0]);
      },
      readFile(file) {
        let reader = new FileReader();
        reader.onload = e => {
          let json = JSON.parse(e.target.result); // FileReader
          console.log(json.transactions)
          //set_transactions(json.transactions)
        };
        reader.readAsText(file);
      }
    }
  }
</script>
