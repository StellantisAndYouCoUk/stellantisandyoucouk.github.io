$(document).on('knack-view-render.view_3773', function(event, view, data) {
    console.log("View render event triggered");
  
    // Function to load a script and return a promise
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src + '?cache-bust=' + new Date().getTime(); // Add cache-busting
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.head.append(script);
      });
    }
    
    // Load jQuery first
    loadScript('https://code.jquery.com/jquery-3.5.1.min.js').then(() => {
      // Load other scripts after jQuery is loaded
      return Promise.all([
        loadScript('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'),
        loadScript('https://unpkg.com/htmx.org@1.8.3'),
        loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11.12.4/dist/sweetalert2.all.min.js')
      ]);
    }).then(() => {
      // Append CSS files after all scripts are loaded
      $('head').append('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" type="text/css" />');
      $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.12.4/dist/sweetalert2.min.css" type="text/css" />');
  
    
  
      // Add Modal Structure to the body
      $(document).on('mouseleave', '.fa-cart-arrow-down', function() {
        // Remove any existing modal with the same ID to prevent duplicates
        $('#myModal').remove();
  
        // Append the modal structure to the body
        let partsModelHTML = '';
        if (partsModelHTML === '') {
          partsModelHTML = $.ajax({
            type: "GET",
            url: 'https://stellantisandyoucouk.github.io/modalHTML/modal.html',
            cache: false,
            async: false
          }).responseText;
        }
        $('body').append(partsModelHTML);
  
        // Show the modal
        $('#myModal').modal({
          keyboard: true,
          show: true,
          handleUpdate: true
        });
  
        $('#searchButton').on('click', function() {
          Swal.fire({
            title: "Bin is Available",
            input: "text",
            inputAttributes: {
              autocapitalize: "on"
            },
            showCancelButton: true,
            confirmButtonText: "Look up",
            showLoaderOnConfirm: true,
            preConfirm: async (login) => {
              try {
                const githubUrl = `https://api.github.com/users/${login}`;
                const response = await fetch(githubUrl);
                if (!response.ok) {
                  return Swal.showValidationMessage(`Request failed: ${response.statusText}`);
                }
                return response.json();
              } catch (error) {
                Swal.showValidationMessage(`Request failed: ${error}`);
              }
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: `${result.value.login}'s avatar`,
                imageUrl: result.value.avatar_url
              });
            }
          });
        });
  
        // Remove the modal from the DOM when it's closed to prevent clutter
        $('#myModal').on('hidden.bs.modal', function() {
          $(this).remove();
        });
  
        console.log("Mouse leave detected");
      });
    }).catch((error) => {
      console.error("Failed to load scripts:", error);
    });
  });