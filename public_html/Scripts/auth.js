/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var authenticate = function() {
  console.log('Call : authenticate');

  $.ajax({
    type: "POST",
    url: url,
    data: data,
    success: success,
    dataType: dataType
  });

  return false;
};

