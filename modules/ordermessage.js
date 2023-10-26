export const messageText = (item) => {
    return `📊 ${item.area} га, ₴  ${item.price} ( ${item.price/item.area} грн/га) 
    дохідність ${item.revenue}% 
    очікуваний річний дохід  ${item.price*item.revenue/100} грн
    ${item.cadastral_number} 
    ${item.state} область, ${item.region} район 
    🚜 орендар: ${item.tenant} , ${item.lease_term} років
            
    `
}
