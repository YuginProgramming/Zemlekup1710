export const messageText = (item) => {
    return `📊 ${item.area} га, ₴  ${item.price} ( ${(item.price/item.area).toFixed(2)} грн/га) 
дохідність ${item.revenue}% 
${item.cadastral_number} 
${item.state} область, ${item.region} район 
🚜 орендар: ${item.tenant} , ${item.lease_term} років
        
`
}
