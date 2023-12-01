export const messageText = (item) => {
    let area;
    let price;
    let pricePerArea;
    let revenue;
    let state;
    let region;
    let tenant;
    let lease_term;
    let cadastral_number;
    let comment;
    if (!isNaN(Number(item.area)) && !(item.area === '')) {
        area = `${item.area} га,`
    } else { area = '' }
    if (!isNaN(Number(item.price)) && !(item.price === '')) { 
        price = `₴  ${item.price}`
    } else { price = '' }
    if (!isNaN(Number(item.price/item.area))) { 
        pricePerArea = `( ${(item.price/item.area).toFixed(2)} грн/га)`
    } else { pricePerArea = '' }
    if (!(item.revenue === '')) {
        revenue = `дохідність ${item.revenue}%` 
    } else { revenue = '' }
    if (!(item.state === '')) {
        state = `${item.state} область,`
    } else { state = '' }
    if (!(item.region === 'not specified')) {
        region = `${item.region} район,`
    } else { region = '' }
    if (!(item.tenant === 'not specified')) {
        tenant = `🚜 орендар: ${item.tenant} ,`
    } else { tenant = '' }
    if (item.lease_term != 0) {
        lease_term = `${item.lease_term} років`
    } else { lease_term = '' }
    if (item.cadastral_number) {
        cadastral_number = item.cadastral_number
    } else { cadastral_number = '' }
    if (!(item.comment === '') && !(item.comment === null)) {
        comment = `${item.comment}\n`
    } else { comment = '' }
    const message =  `${comment}📊 ${area} ${price} ${pricePerArea}
${revenue}
${cadastral_number}
${state} ${region}
${tenant} ${lease_term}
    `
    return message;


}

export const messageTextCompleate = (item) => {
    let area;
    let price;
    let pricePerArea;
    let revenue;
    let state;
    let region;
    let tenant;
    let lease_term;
    let cadastral_number;
    let comment;
    if (!isNaN(Number(item.area)) && !(item.area === '')) {
        area = `${item.area} га,`
    } else { area = '' }
    if (!isNaN(Number(item.price)) && !(item.price === '')) { 
        price = `₴  ${item.price}`
    } else { price = '' }
    if (!isNaN(Number(item.price/item.area))) { 
        pricePerArea = `( ${(item.price/item.area).toFixed(2)} грн/га)`
    } else { pricePerArea = '' }
    if (!(item.revenue === '')) {
        revenue = `дохідність ${item.revenue}%` 
    } else { revenue = '' }
    if (!(item.state === '')) {
        state = `${item.state} область,`
    } else { state = '' }
    if (!(item.region === 'not specified')) {
        region = `${item.region} район,`
    } else { region = '' }
    if (!(item.tenant === 'not specified')) {
        tenant = `орендар: ${item.tenant} ,`
    } else { tenant = '' }
    if (item.lease_term != 0) {
        lease_term = `${item.lease_term} років`
    } else { lease_term = '' }
    if (item.cadastral_number) {
        cadastral_number = item.cadastral_number
    } else { cadastral_number = '' }
    if (!(item.comment === '') && !(item.comment === null)) {
        comment = `${item.comment}\n`
    } else { comment = '' }

    const message =  `${comment}${area} ${price} ${pricePerArea}
${revenue}
${cadastral_number}
${state} ${region}
${tenant} ${lease_term}
    `
    return message;


}
