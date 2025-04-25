function wrapText(text, maxChars) {
  const lines = [];
  for (let i = 0; i < text.length; i += maxChars) {
    lines.push(text.substring(i, i + maxChars));
  }
  return lines;
}
export const Print = async data => {
  try {
    // await BluetoothEscposPrinter.printPic64(chillLogo, { width: 200, height: 150 });

    await BluetoothEscposPrinter.setBlob(3);
    await BluetoothEscposPrinter.printColumn(
      [33],
      [BluetoothEscposPrinter.ALIGN.CENTER],
      ['\x1B\x61\x01' + data.toko.nama_toko],
      {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 2, // lebar font 2x
        heigthtimes: 2, // tinggi font 2x
        fonttype: 0, // jenis font
      },
    );
    await BluetoothEscposPrinter.setBlob(0);
    const alamatToko = data.toko.alamat_toko;
    const wrappedAlamat = wrapText(alamatToko, 32);
    for (const line of wrappedAlamat) {
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [line],
        {},
      );
    }
    if (data.toko.whatsapp != null && data.toko.whatsapp != '') {
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        ['Telp/wa : ' + data.toko.whatsapp],
        {},
      );
    }
    if (data.toko.instagram != null && data.toko.instagram != '') {
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.CENTER],
        ['Instagram : ' + data.toko.instagram],
        {},
      );
    }
    await BluetoothEscposPrinter.printText(
      '================================',
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [32],
      [BluetoothEscposPrinter.ALIGN.LEFT],
      [data.id_transaksi],
      {},
    );
    // await BluetoothEscposPrinter.printColumn(
    //   [9, 24],
    //   [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
    //   ['', data.id_transaksi],
    //   {},
    // );
    await BluetoothEscposPrinter.printColumn(
      [10, 22],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Tanggal', moment(data.created_at).format('DD MMM yyyy HH:mm:ss')],
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [10, 22],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      [
        'Kasir',
        data.user?.pemilik?.nama_pemilik || data.user?.pekerja?.nama_pekerja,
      ],
      {},
    );

    await BluetoothEscposPrinter.printColumn(
      [17, 15],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Jenis Pembayaran', data.jenis_pembayaran],
      {},
    );

    await BluetoothEscposPrinter.printColumn(
      [11, 10, 11],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ['==========', 'Pesanan', '=========='],
      {},
    );
    // CartReducer.cartitem.map(async(items,index)=>{

    for (const element of data.detail_transaksi) {
      const product = element.produk;
      const quantity = element.qty;
      const pricePerUnit = element.harga;
      const subtotal = quantity * pricePerUnit;
      const formattedSubtotal = 'Rp.' + currency.format(subtotal);
      await BluetoothEscposPrinter.setBlob(3);
      await BluetoothEscposPrinter.printColumn(
        [32],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        [product.nama_produk],
        {},
      );
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.printColumn(
        [16, 16],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        [`${quantity}x Rp.${currency.format(pricePerUnit)}`, formattedSubtotal],
        {},
      );
    }
    await BluetoothEscposPrinter.printText(
      '================================',
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      [
        'Subtotal',
        'Rp.' +
          currency
            .format(
              data.detail_transaksi.reduce(
                (result, item) => item.subtotal + result,
                0,
              ),
            )
            .toString(),
      ],
      {},
    );
    data.ppn != 0 && data.ppn != '' && data.ppn != null
      ? await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          ['Ppn', data.ppn.toString() + '%'],
          {},
        )
      : null;
    data.ppn != '' && data.ppn != 0 && data.ppn != null
      ? await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          ['PPN', 'Rp.' + currency.format(data.bulatppn)],
          {},
        )
      : null;

    // Diskon
    data.valuediskon != '' && data.valuediskon != 0 && data.valuediskon != null
      ? await BluetoothEscposPrinter.printColumn(
          [16, 16],
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          [
            'Diskon',
            data.tipediskon == 'nominal'
              ? 'Rp.' + currency.format(data.valuediskon)
              : data.valuediskon.toString() + '%',
          ],
          {},
        )
      : null;
    await BluetoothEscposPrinter.printText(
      '================================',
      {},
    );
    await BluetoothEscposPrinter.setBlob(3);
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Total', 'Rp.' + currency.format(data.totalharga).toString()],
      {},
    );
    await BluetoothEscposPrinter.setBlob(0);

    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Tunai', 'Rp.' + currency.format(data.pembayaran).toString()],
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [16, 16],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
      ['Kembalian', 'Rp.' + currency.format(data.kembalian).toString()],
      {},
    );
    await BluetoothEscposPrinter.printText(
      '================================',
      {},
    );
    await BluetoothEscposPrinter.printColumn(
      [32],
      [BluetoothEscposPrinter.ALIGN.CENTER],
      ['"' + 'Terimakasih Atas Kunjungannya' + '"'],
      {},
    );
    await BluetoothEscposPrinter.printText('\r\n', {});
  } catch (e) {
    alert(e.message || 'ERROR');
  }
};
