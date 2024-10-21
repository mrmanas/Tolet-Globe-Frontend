import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import "./listing.css";
import Service from "../../config/config";
import author from "../../assets/property/author.jpg";
import hamburger from "../../assets/property/hamburger.png";
import drop from "../../assets/property/drop.png";
import loc from "../../assets/property/location.png";
import cross from "../../assets/property/cross.png";
import SideOpt from "./listingComponents/SideOpt";
import SelectLocation from "./listingComponents/SelectLocation";
import Filters from "./listingComponents/Filters";
import Cards from "./listingComponents/Cards";
import Pagination from "./listingComponents/Pagination";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { IoAdd, IoBedOutline, IoRemove } from "react-icons/io5";

const Listing = (props) => {
  const { city } = useParams();

  const [Hamburger, SetHamburger] = useState(false);
  const [isOpen, SetIsOpen] = useState(false);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [Location, setLocation] = useState(false);
  const location = useLocation();
  const propertiesPerPage = 9;

  const [filterCount, setFilterCount] = useState(0);

  const authState = useSelector((state) => state.auth);

  function handleOpen() {
    SetIsOpen(!isOpen);
  }
  function handleHamburger() {
    SetHamburger(!Hamburger);
  }
  function handleLocation() {
    setLocation(!Location);
  }
  const { slug } = useParams();
  function handleMode() {
    setMode(!mode);
  }
  function handleShowCity() {
    setShowCity(!showCity);
  }

  useEffect(() => {
    const fetchAndFilterProperties = async () => {
      setLoading(true);
      try {
        const propertyData = await Service.fetchPropertyByCity(city);
        setProperties(propertyData || []);

        const searchParams = new URLSearchParams(location.search);
        const type = searchParams.get("type");
        console.log("Type of property:", type);

        if (type === "Flat") {
          setProperties(propertyData.filter((a) => a.propertyType === "Flat"));
        } else if (type === "House/Villa") {
          setProperties(
            propertyData.filter(
              (a) => a.propertyType === "House" || a.propertyType === "Villa"
            )
          );
        } else if (type === "Shop") {
          setProperties(propertyData.filter((a) => a.propertyType === "Shop"));
        } else if (type === "Office") {
          setProperties(
            propertyData.filter((a) => a.propertyType === "Office")
          );
        } else if (type === "Warehouse") {
          setProperties(
            propertyData.filter((a) => a.propertyType === "Ware house")
          );
        } else if (type === "PayingGuest") {
          setProperties(
            propertyData.filter((a) => a.propertyType === "Paying Guest")
          );
        }

        const sortType = searchParams.get("sort");
        if (sortType) {
          sortProperties(propertyData, sortType);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    };

    fetchAndFilterProperties();
  }, [location.search]);

  const sortProperties = (properties, sortType) => {
    let sortedProperties = [...properties];

    if (sortType === "price-low-high") {
      sortedProperties.sort((a, b) => a.rent - b.rent);
    } else if (sortType === "price-high-low") {
      sortedProperties.sort((a, b) => b.rent - a.rent);
    } else if (sortType === "most-trending") {
      sortedProperties.sort((a, b) => b.reviews.length - a.reviews.length);
    } else if (sortType === "date-uploaded") {
      sortedProperties.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setProperties(sortedProperties);
  };

  const totalPages = Math.ceil(properties.length / propertiesPerPage);

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = Array.isArray(properties)
    ? properties.slice(indexOfFirstProperty, indexOfLastProperty)
    : [];

  const handleSortClick = (sortType) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sort", sortType);
    navigate(`?${queryParams.toString()}`); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#6CC1B6" size={150} />
      </div>
    );
  }

  const handleAddPropertybtn = () => {
    if (authState.status === true && localStorage.getItem("token")) {
      navigate("/landlord-dashboard", { state: { content: "AddProperty" } });
    } else {
      toast.error("Please Log In first");
    }
  };

  const handleToggle = (event, property) => {
    event.preventDefault();

    props.setcompareData((prev) => {
      const isAlreadySelected = prev.some((p) => p._id === property._id);

      if (isAlreadySelected) {
        return prev.filter((p) => p._id !== property._id);
      }

      if (prev.length < 4) {
        return [...prev, property];
      } else {
        return prev;
      }
    });
  };

  const isInCompareList = (propertyId) => {
    return props.compareData.some((p) => p._id === propertyId);
  };

  const compare = () => {
    navigate("/compare-property");
  };

  const handleViewBlog = (slug) => {
    navigate(`/blog/${slug}`);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const onPageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const updateFilterCount = (count) => {
    setFilterCount(count);
  };

  return (
    <>
      <div
        className={`bg-black opacity-80 w-full h-[2600px] absolute z-20 ${isOpen || Hamburger || Location ? "block" : "hidden"
          }`}
      ></div>

      <section className="property h-[100vh] pb-14 px-10 w-full overflow-y-auto" id="property">
        <div className="px-3 flex flex-col gap-12 py-12 sticky top-0 z-30 bg-black">
          <div className="flex items-center justify-between">
            <p className="lg:text-5xl md:text-4xl text-2xl text-[#C8A21C] font-bold">
              Property Listing
            </p>
            <img
              src={hamburger}
              alt="Hamburger Menu"
              className="cursor-pointer lg:w-12 md:w-11 w-9 h-auto"
            />
          </div>

          <div className="flex justify-between gap-14 w-full flex-wrap">
            <div className="flex items-center justify-between gap-20 md:gap-36 lg:gap-36 ml-4 flex-col md:flex-row lg:flex-row">
              <div className="bg-white h-14 w-64 md:w-80 lg:w-80 flex items-center justify-between text-black px-4 rounded-md">
                <div className="w-1/4 flex items-center justify-start gap-2 md:gap-4 lg:gap-4 border-r-2 h-3/4 border-black">
                  <p className="text-black">Sort</p>
                  <img
                    src={drop}
                    alt="Dropdown"
                    className={`${mode ? "rotate-180" : "rotate-0"
                      } mt-1 cursor-pointer`}
                    onClick={handleMode}
                  />
                  <div className="relative">
                    <div
                      className={`${mode ? "block" : "hidden"
                        } z-50 absolute bg-white shadow-lg rounded-lg text-center w-40 py-3 top-[50px] left-[-110px]`}
                    >
                      <p
                        className="border-b-2 py-2 text-lg font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          handleSortClick("price-low-high"), setMode(false);
                        }}
                      >
                        Price: Low to High
                      </p>
                      <p
                        className="border-b-2 py-2 text-lg font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          handleSortClick("price-high-low"), setMode(false);
                        }}
                      >
                        Price: High to Low
                      </p>
                      <p
                        className="border-b-2 py-2 text-lg font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          handleSortClick("most-trending"), setMode(false);
                        }}
                      >
                        Most Trending
                      </p>
                      <p
                        className="py-2 text-lg font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          handleSortClick("date-uploaded"), setMode(false);
                        }}
                      >
                        Date Uploaded
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <p className="text-[#C8A21C]">{filterCount} Filters</p>
                <div className="flex flex-col">
                  <button
                    onClick={compare}
                    className="bg-[#6CC1B6] w-16 h-10 rounded-md text-white font-bold"
                  >
                    Compare
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddPropertybtn}
                  className="bg-[#6CC1B6] h-10 w-24 rounded-md text-white font-bold flex items-center justify-center"
                >
                  <IoAdd className="mr-2" />
                  Add Property
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-5 mt-8">
          <SideOpt
            handleOpen={handleOpen}
            isOpen={isOpen}
            setProperties={setProperties}
            city={city}
            updateFilterCount={updateFilterCount}
          />

          <SelectLocation
            showCity={showCity}
            setShowCity={setShowCity}
            city={city}
          />

          <Filters
            handleLocation={handleLocation}
            Location={Location}
            setProperties={setProperties}
            city={city}
            updateFilterCount={updateFilterCount}
          />
        </div>

        <div className="flex flex-col items-center">
          <Cards
            currentProperties={currentProperties}
            handleToggle={handleToggle}
            isInCompareList={isInCompareList}
            handleViewBlog={handleViewBlog}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          onPageChange={onPageChange}
        />
      </section>
    </>
  );
};

export default Listing;
