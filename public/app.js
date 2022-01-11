$(function() {
    $( "#s_input" ).autocomplete({
      source: "search",
      minLength: 1,
    });
    // function log( message ) {
    //   $( "<div>" ).text( message ).prependTo( "#log" );
    //   $( "#log" ).scrollTop( 0 );
    // }

    // $( "#s_input" ).autocomplete({
    //   source: function( request, response ) {
    //     $.ajax( {
    //       url: "search",
    //       dataType: "jsonp",
    //       data: {
    //         squery: request.term
    //       },
    //       success: function( data ) {
    //         response( data );
    //       }
    //     } );
    //   },
    //   minLength: 1,
    //   select: function( event, ui ) {
    //     log( "Selected: " + ui.item.value + " aka " + ui.item.id );
    //   }
    // } );
});